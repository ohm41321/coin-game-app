// app/api/gm-login/route.ts
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getGMPasswordHash, updateGameState } from '@/lib/gameState';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const providedPasswordHash = createHash('sha256').update(password).digest('hex');
    const correctPasswordHash = getGMPasswordHash();

    if (providedPasswordHash !== correctPasswordHash) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    await updateGameState((currentState) => {
      currentState.gm.isLoggedIn = true;
      return currentState;
    });

    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    console.error('GM Login Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
