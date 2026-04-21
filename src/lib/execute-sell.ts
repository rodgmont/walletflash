import { getUser } from '@/lib/db';

export type SellSuccess = {
  ok: true;
  fiatAmount: number;
  satsProcessed: number;
  transactionId?: string;
  provider: string;
  mode: 'flash' | 'simulated';
};

export type SellFailure = {
  ok: false;
  error: string;
  status: number;
};

export type SellOutcome = SellSuccess | SellFailure;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function readNestedNumber(obj: unknown, path: string[]): number | undefined {
  let cur: unknown = obj;
  for (const key of path) {
    if (!isRecord(cur)) return undefined;
    cur = cur[key];
  }
  return typeof cur === 'number' && Number.isFinite(cur) ? cur : undefined;
}

/**
 * Ejecuta la venta de sats vía proxy hacia Flash API.
 * El cuerpo exacto debe alinearse con https://docs.bitcoinflash.xyz (Transactions / sell).
 * Si la documentación difiere, ajusta FLASH_SELL_AMOUNT_FIELD y el mapeo en buildSellBody.
 */
function buildSellBody(
  sats: number,
  user: { provider: string; mobileNumber: string },
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    amount: sats,
    source_currency: 'BTC',
    destination_currency: 'XOF',
    payout_method: user.provider,
    payout_address: user.mobileNumber,
  };
  const extraRaw = process.env.FLASH_SELL_EXTRA_JSON;
  if (extraRaw) {
    try {
      const parsed: unknown = JSON.parse(extraRaw);
      if (isRecord(parsed)) {
        return { ...base, ...parsed };
      }
    } catch {
      /* ignore invalid JSON */
    }
  }
  return base;
}

export async function sellSatsForUser(username: string, sats: number): Promise<SellOutcome> {
  if (!Number.isFinite(sats) || sats <= 0) {
    return { ok: false, error: 'Invalid sats amount', status: 400 };
  }

  const user = getUser(username);
  if (!user) {
    return { ok: false, error: 'User does not exist in DB', status: 404 };
  }

  const flashApiBase =
    process.env.NEXT_PUBLIC_FLASH_API?.replace(/\/$/, '') ||
    'https://api.bitcoinflash.xyz/api/v1';
  const flashJwt = process.env.FLASH_API_SECRET;

  if (!flashJwt) {
    return {
      ok: true,
      mode: 'simulated',
      fiatAmount: Math.floor(sats * 0.4),
      satsProcessed: sats,
      provider: user.provider,
    };
  }

  const flashResponse = await fetch(`${flashApiBase}/transactions/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${flashJwt}`,
    },
    body: JSON.stringify(buildSellBody(sats, user)),
  });

  let result: unknown;
  try {
    result = await flashResponse.json();
  } catch {
    return { ok: false, error: 'Invalid JSON from Flash API', status: 502 };
  }

  const successFlag = isRecord(result) && result.success === true;
  const message =
    isRecord(result) && typeof result.message === 'string' ? result.message : 'Flash API error';

  if (!flashResponse.ok || !successFlag) {
    return { ok: false, error: message, status: flashResponse.status || 502 };
  }

  const data = isRecord(result) && isRecord(result.data) ? result.data : undefined;
  const fiatAmount =
    (data && readNestedNumber(data, ['received_amount'])) ?? Math.floor(sats * 0.4);

  const transactionId =
    (data && typeof data.transaction_id === 'string' && data.transaction_id) ||
    (data && typeof data.id === 'string' && data.id) ||
    undefined;

  return {
    ok: true,
    mode: 'flash',
    fiatAmount,
    satsProcessed: sats,
    transactionId,
    provider: user.provider,
  };
}
