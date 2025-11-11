import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { status } = body;

    // Get bill
    const bill = await prisma.bill.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!bill) {
      return NextResponse.json(
        { message: 'Bill not found' },
        { status: 404 }
      );
    }

    // Check permission
    if (user.role === 'CUSTOMER' && bill.userId !== user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update bill
    let updateData: any = {};

    if (status === 'PAID') {
      updateData = {
        status: 'PAID',
        paidDate: new Date()
      };

      // Create notification
      await prisma.notification.create({
        data: {
          userId: bill.userId,
          title: 'Pembayaran Diterima',
          message: `Pembayaran tagihan ${bill.invoiceNumber} telah diterima`,
          type: 'PAYMENT_RECEIVED',
          relatedId: bill.id
        }
      });
    } else if (status === 'CANCELLED') {
      updateData = { status: 'CANCELLED' };
    }

    const updatedBill = await prisma.bill.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        pickup: {
          select: { id: true, scheduledDate: true, volume: true }
        }
      }
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
