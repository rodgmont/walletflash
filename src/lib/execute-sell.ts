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

/**
 * Convierte sats a XOF usando la tasa de referencia.
 * Flash usa XOF como unidad de `amount` en su API.
 * Tasa aproximada: 1 BTC ≈ 55 000 000 XOF → 1 sat ≈ 0.55 XOF
 * Si tienes una tasa real disponible, pásala en FLASH_XOF_PER_SAT.
 */
function satsToXof(sats: number): number {
  const rateRaw = process.env.FLASH_XOF_PER_SAT;
  const rate = rateRaw ? parseFloat(rateRaw) : 0.55;
  return Math.floor(sats * rate);
}

/**
 * Construye el cuerpo para POST /api/v1/transactions/create
 * Documentación oficial: https://docs.bitcoinflash.xyz/api-reference/transactions/create
 */
function buildSellBody(
  sats: number,
  user: { provider: string; mobileNumber: string },
): Record<string, unknown> {
  return {
    amount: satsToXof(sats),          // XOF amount (fiat a recibir)
    type: 'SELL_BITCOIN',             // venta de BTC → XOF
    number: user.mobileNumber,        // número de mobile money
    receiver_address: user.mobileNumber, // dirección de pago MoMo
  };
}

function buildHeaders(jwt?: string, stagingUserId?: string): HeadersInit {
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (jwt) {
    base['Authorization'] = `Bearer ${jwt}`;
  } else if (stagingUserId) {
    // Staging-only: usa X-Staging-User-Id en lugar de JWT
    // https://docs.bitcoinflash.xyz/authentication
    base['X-Staging-User-Id'] = stagingUserId;
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
    (process.env.NEXT_PUBLIC_FLASH_API?.replace(/\/$/, '')) ||
    'https://staging.bitcoinflash.xyz/api/v1';

  const flashJwt = process.env.FLASH_API_SECRET;
  const stagingUserId = process.env.FLASH_STAGING_USER_ID;

  // Sin ninguna credencial → modo simulado
  if (!flashJwt && !stagingUserId) {
    return {
      ok: true,
      mode: 'simulated',
      fiatAmount: satsToXof(sats),
      satsProcessed: sats,
      provider: user.provider,
    };
  }

  let flashResponse: Response;
  try {
    flashResponse = await fetch(`${flashApiBase}/transactions/create`, {
      method: 'POST',
      headers: buildHeaders(flashJwt, stagingUserId),
      body: JSON.stringify(buildSellBody(sats, user)),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: `No se pudo contactar Flash API: ${msg}`, status: 503 };
  }

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

  // Respuesta exitosa: { success: true, transaction: { id, amount, exchange_rate, status, ... } }
  const tx = isRecord(result) && isRecord(result.transaction) ? result.transaction : undefined;

  const fiatAmount =
    (tx && typeof tx.amount === 'number' ? tx.amount : undefined) ?? satsToXof(sats);

  const transactionId =
    (tx && typeof tx.id === 'string' ? tx.id : undefined) ||
    (tx && typeof tx.reference === 'string' ? tx.reference : undefined);

  return {
    ok: true,
    mode: 'flash',
    fiatAmount,
    satsProcessed: sats,
    transactionId,
    provider: user.provider,
  };
}
