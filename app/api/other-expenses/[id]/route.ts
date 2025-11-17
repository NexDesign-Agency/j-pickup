import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/other-expenses/[id] - Update other expense (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { description, amount, date } = body;

    const expense = await prisma.otherExpense.update({
      where: { id: params.id },
      data: {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : undefined
      }
    });

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('Update other expense error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/other-expenses/[id] - Delete other expense (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    await prisma.otherExpense.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Delete other expense error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
