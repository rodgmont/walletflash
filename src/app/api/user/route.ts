import { NextResponse } from 'next/server';
import { saveUser, getUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.username || !data.provider || !data.mobileNumber) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    saveUser({
      username: data.username,
      provider: data.provider,
      mobileNumber: data.mobileNumber,
      autoConvertLimit: data.autoConvertLimit || 100,
      lnurlConfig: {
        minSendable: 1000,
        maxSendable: 100000000,
      },
    });

    return NextResponse.json({ success: true, message: 'User registered' });
  } catch {
    return NextResponse.json({ success: false, error: 'Error saving user' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return NextResponse.json({ success: false, error: 'Missing username parameter' }, { status: 400 });
  }

  const user = getUser(username);

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
}
