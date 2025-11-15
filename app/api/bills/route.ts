import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};

    // CUSTOMER can only see their own bills
    // ADMIN and WAREHOUSE can see all bills
    if (user.role === 'CUSTOMER') {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        pickup: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
            courier: { select: { id: true, name: true, phone: true } }
          }
        },
        user: { select: { id: true, name: true, email: true, phone: true, address: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
