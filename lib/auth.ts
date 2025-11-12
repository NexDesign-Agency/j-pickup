import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided in request');
      return null;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured!');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch (error: any) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ message }, { status: 403 });
}
