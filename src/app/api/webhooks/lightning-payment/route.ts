import { NextResponse } from 'next/server';
import { sellSatsForUser } from '@/lib/execute-sell';

/**
 * Punto de enganche para un procesador Lightning (LND, servicio LNURL, etc.):
 * al liquidarse un cobro, llama a este endpoint con el secreto compartido.
 */
export async function POST(request: Request) {
  const secret = process.env.LIGHTNING_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'LIGHTNING_WEBHOOK_SECRET is not configured' },
      { status: 503 },
    );
  }

  const headerSecret = request.headers.get('x-flash-webhook-secret');
  if (headerSecret !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const username = typeof record.username === 'string' ? record.username : '';
  const satsRaw = record.sats;
  const sats = typeof satsRaw === 'number' ? satsRaw : Number(satsRaw);

  if (!username || !Number.isFinite(sats) || sats <= 0) {
    return NextResponse.json(
      { success: false, error: 'Expected { username: string, sats: number }' },
      { status: 400 },
    );
  }

  const outcome = await sellSatsForUser(username, sats);
  if (!outcome.ok) {
    return NextResponse.json({ success: false, error: outcome.error }, { status: outcome.status });
  }

  return NextResponse.json({
    success: true,
    fiatAmount: outcome.fiatAmount,
    satsProcessed: outcome.satsProcessed,
    transactionId: outcome.transactionId,
    provider: outcome.provider,
    mode: outcome.mode,
  });
}
