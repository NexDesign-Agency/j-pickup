import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { normalizePhone } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let where: any = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      const normalizedPhone = normalizePhone(search);
      const phoneCandidates = [normalizedPhone, search];
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        // Try normalized exact match for phone
        { phone: { in: phoneCandidates } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          role: true,
          isActive: true,
          referralCode: true,
          createdAt: true,
          _count: {
            select: {
              pickupsAsCustomer: true,
              pickupsAsCourier: true,
              referrals: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { name, email, phone, address, role, password } = body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with unique referral code
    let referralCode = randomUUID().slice(0, 8).toUpperCase();
    let codeExists = true;
    while (codeExists) {
      const existing = await prisma.user.findUnique({
        where: { referralCode }
      });
      if (!existing) {
        codeExists = false;
      } else {
        referralCode = randomUUID().slice(0, 8).toUpperCase();
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address: address || null,
        role,
        password: hashedPassword,
        referralCode,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        isActive: true,
        referralCode: true,
        createdAt: true
      }
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
