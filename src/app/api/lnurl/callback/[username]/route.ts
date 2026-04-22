import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db';
import { publicLnurlCorsHeaders } from '@/lib/cors-public';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicLnurlCorsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const url = new URL(request.url);
  const amountMsatsStr = url.searchParams.get('amount');

  if (!amountMsatsStr) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Missing amount parameter in millisatoshis' },
      { status: 400, headers: publicLnurlCorsHeaders() },
    );
  }

  const amountMsats = parseInt(amountMsatsStr, 10);
  const user = getUser(username);

  if (!user) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'User not found' },
      { status: 404, headers: publicLnurlCorsHeaders() },
    );
  }

  const min = user.lnurlConfig?.minSendable || 1000;
  const max = user.lnurlConfig?.maxSendable || 100000000;

  if (amountMsats < min || amountMsats > max) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Amount is out of bounds' },
      { status: 400, headers: publicLnurlCorsHeaders() },
    );
  }

  /**
   * Production: generate a real BOLT11 invoice via your Lightning node or provider (LND, CLN, LNURL service).
   * After payment, the service must call POST /api/webhooks/lightning-payment with LIGHTNING_WEBHOOK_SECRET.
   */
  const placeholderInvoice = `lnbc${amountMsats}p_simulated_invoice_for_${username}_${Date.now()}`;

  return NextResponse.json(
    { pr: placeholderInvoice, routes: [] },
    { headers: publicLnurlCorsHeaders() },
  );
}
