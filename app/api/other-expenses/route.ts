import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/other-expenses - Get all other expenses (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    if (user.role !== 'ADMIN' && user.role !== 'WAREHOUSE') {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const expenses = await prisma.otherExpense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Get other expenses error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/other-expenses - Create other expense (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { description, amount, date } = body;

    if (!description || !amount) {
      return NextResponse.json(
        { message: 'Keterangan dan nominal wajib diisi' },
        { status: 400 }
      );
    }

    const expense = await prisma.otherExpense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error('Create other expense error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
