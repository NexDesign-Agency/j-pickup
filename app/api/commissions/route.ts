import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // COURIER or AFFILIATE

    const where: any = {};

    // COURIER and AFFILIATE can only see their own commissions
    // ADMIN and WAREHOUSE can see all commissions
    if (user.role === 'COURIER' || user.role === 'CUSTOMER') {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        pickup: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            courier: { select: { id: true, name: true, phone: true } }
          }
        },
        user: { select: { id: true, name: true, email: true, phone: true, address: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(commissions);
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
