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
  const user = getUser(username);

  if (!user) {
    return NextResponse.json(
      { status: 'ERROR', reason: 'User not found' },
      { status: 404, headers: publicLnurlCorsHeaders() },
    );
  }

  const url = new URL(request.url);
  const callbackUrl = `${url.protocol}//${url.host}/api/lnurl/callback/${username}`;

  const responseData = {
    callback: callbackUrl,
    maxSendable: user.lnurlConfig?.maxSendable || 100000000,
    minSendable: user.lnurlConfig?.minSendable || 1000,
    metadata: `[["text/plain", "Pay to Flash Account ${username}"]]`,
    tag: 'payRequest',
  };

  return NextResponse.json(responseData, { headers: publicLnurlCorsHeaders() });
}
