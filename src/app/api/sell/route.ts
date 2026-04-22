import { NextResponse } from 'next/server';
import { sellSatsForUser } from '@/lib/execute-sell';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const username = typeof record.username === 'string' ? record.username : '';
    const satsRaw = record.sats;
    const sats = typeof satsRaw === 'number' ? satsRaw : Number(satsRaw);

    if (!username || !Number.isFinite(sats)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (sats, username)' },
        { status: 400 },
      );
    }

    const outcome = await sellSatsForUser(username, sats);

    if (!outcome.ok) {
      return NextResponse.json({ success: false, error: outcome.error }, { status: outcome.status });
    }

    return NextResponse.json({
      success: true,
      message:
        outcome.mode === 'simulated'
          ? 'Sats sold successfully (simulated — set FLASH_API_SECRET or FLASH_STAGING_USER_ID for live Flash API)'
          : 'Transaction completed via Flash API',
      fiatAmount: outcome.fiatAmount,
      satsProcessed: outcome.satsProcessed,
      transactionId: outcome.transactionId,
      provider: outcome.provider,
      mode: outcome.mode,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Flash API Sell error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
