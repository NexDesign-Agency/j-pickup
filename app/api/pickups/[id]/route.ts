import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/pickups/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const pickup = await prisma.pickup.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, address: true, email: true }
        },
        courier: {
          select: { id: true, name: true, phone: true }
        },
        warehouse: {
          select: { id: true, name: true }
        },
        bills: true,
        commissions: true,
        messages: {
          include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!pickup) {
      return NextResponse.json(
        { message: 'Pickup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pickup);
  } catch (error) {
    console.error('Get pickup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/pickups/[id] - Update pickup status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { status, courierId, warehouseId, photoProof, actualVolume } = body;

    const pickup = await prisma.pickup.findUnique({
      where: { id: params.id }
    });

    if (!pickup) {
      return NextResponse.json(
        { message: 'Pickup not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    // Handle photo proof and actual volume updates (for IN_PROGRESS pickups)
    if ((photoProof !== undefined || actualVolume !== undefined) && user.role === 'COURIER' && pickup.courierId === user.id) {
      if (pickup.status !== 'IN_PROGRESS') {
        return NextResponse.json(
          { message: 'Can only update photo and volume during IN_PROGRESS status' },
          { status: 400 }
        );
      }
      if (photoProof !== undefined) updateData.photoProof = photoProof;
      if (actualVolume !== undefined) updateData.actualVolume = parseFloat(actualVolume);
    }

    // Handle status updates based on role
    if (status) {
      // Courier accepting a pending pickup
      if (status === 'ASSIGNED' && user.role === 'COURIER' && pickup.status === 'PENDING') {
        updateData = {
          ...updateData,
          status: 'ASSIGNED',
          courierId: user.id
        };
      }
      // Courier starting an assigned pickup
      else if (status === 'IN_PROGRESS' && user.role === 'COURIER' && pickup.courierId === user.id && pickup.status === 'ASSIGNED') {
        updateData = {
          ...updateData,
          status: 'IN_PROGRESS',
          actualDate: new Date()
        };
      }
      // Courier completing a pickup
      else if (status === 'COMPLETED' && user.role === 'COURIER' && pickup.courierId === user.id && pickup.status === 'IN_PROGRESS') {
        // Validate that photo proof and actual volume are provided
        if (!pickup.photoProof || !pickup.actualVolume) {
          return NextResponse.json(
            { message: 'Photo proof and actual volume are required before completing pickup' },
            { status: 400 }
          );
        }

        // Calculate actual prices based on actual volume
        const actualTotalPrice = pickup.actualVolume * pickup.pricePerLiter;
        const actualCourierFee = actualTotalPrice * 0.1;
        const actualAffiliateFee = pickup.affiliateFee > 0 ? actualTotalPrice * 0.05 : 0;

        updateData = {
          ...updateData,
          status: 'COMPLETED',
          totalPrice: actualTotalPrice,
          courierFee: actualCourierFee,
          affiliateFee: actualAffiliateFee
        };

        // Create bill when completed
        const invoiceNumber = `INV-${Date.now()}`;

        await prisma.bill.create({
          data: {
            pickupId: pickup.id,
            userId: pickup.customerId,
            amount: actualTotalPrice,
            status: 'UNPAID',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            invoiceNumber
          }
        });

        // Create commissions
        if (pickup.courierId) {
          await prisma.commission.create({
            data: {
              pickupId: pickup.id,
              userId: pickup.courierId,
              type: 'COURIER',
              amount: actualCourierFee,
              status: 'PENDING'
            }
          });
        }

        if (actualAffiliateFee > 0) {
          const customer = await prisma.user.findUnique({
            where: { id: pickup.customerId },
            select: { referredById: true }
          });

          if (customer?.referredById) {
            await prisma.commission.create({
              data: {
                pickupId: pickup.id,
                userId: customer.referredById,
                type: 'AFFILIATE',
                amount: actualAffiliateFee,
                status: 'PENDING'
              }
            });
          }
        }

        // Create notification
        await prisma.notification.create({
          data: {
            userId: pickup.customerId,
            title: 'Pickup Completed',
            message: `Your pickup has been completed. Invoice: ${invoiceNumber}`,
            type: 'PICKUP_COMPLETED',
            relatedId: pickup.id
          }
        });
      }
      // Warehouse can also mark as completed (legacy support)
      else if (status === 'COMPLETED' && user.role === 'WAREHOUSE') {
        updateData = {
          ...updateData,
          status: 'COMPLETED',
          warehouseId: user.id
        };
      }
      // Cancellation
      else if (status === 'CANCELLED' && (user.role === 'CUSTOMER' || user.role === 'ADMIN')) {
        updateData = { ...updateData, status: 'CANCELLED' };
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No valid updates provided' },
        { status: 400 }
      );
    }

    const updatedPickup = await prisma.pickup.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        courier: { select: { id: true, name: true, phone: true } },
        warehouse: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(updatedPickup);
  } catch (error: any) {
    console.error('Update pickup error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
