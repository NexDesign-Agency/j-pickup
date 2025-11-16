const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password untuk semua user
  const hashedPassword = await bcrypt.hash('demo123', 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jelantahgo.com' },
    update: {},
    create: {
      email: 'admin@jelantahgo.com',
      password: hashedPassword,
      name: 'Admin JelantahGO',
      phone: '081234567890',
      address: 'Jakarta Pusat',
      kota: 'Jakarta Pusat',
      role: 'ADMIN',
      isActive: true,
      referralCode: 'ADMIN001'
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create Customer Users
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@jelantahgo.com' },
    update: {},
    create: {
      email: 'customer1@jelantahgo.com',
      password: hashedPassword,
      name: 'Budi Santoso',
      phone: '081234567891',
      address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
      kota: 'Jakarta Barat',
      latitude: -6.200000,
      longitude: 106.816666,
      role: 'CUSTOMER',
      isActive: true,
      referralCode: 'CUST001'
    }
  })
  console.log('✅ Customer 1 created:', customer1.email)

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@jelantahgo.com' },
    update: {},
    create: {
      email: 'customer2@jelantahgo.com',
      password: hashedPassword,
      name: 'Siti Aminah',
      phone: '081234567892',
      address: 'Jl. Melati No. 45, Jakarta Selatan',
      kota: 'Jakarta Selatan',
      latitude: -6.200000,
      longitude: 106.816666,
      role: 'CUSTOMER',
      isActive: true,
      referralCode: 'CUST002'
    }
  })
  console.log('✅ Customer 2 created:', customer2.email)

  // Create Courier Users
  const courier = await prisma.user.upsert({
    where: { email: 'courier@jelantahgo.com' },
    update: {},
    create: {
      email: 'courier@jelantahgo.com',
      password: hashedPassword,
      name: 'Andi Wijaya',
      phone: '081234567893',
      address: 'Jakarta Barat',
      kota: 'Jakarta Barat',
      role: 'COURIER',
      isActive: true,
      referralCode: 'COUR001'
    }
  })
  console.log('✅ Courier created:', courier.email)

  const courier2 = await prisma.user.upsert({
    where: { email: 'courier2@jelantahgo.com' },
    update: {},
    create: {
      email: 'courier2@jelantahgo.com',
      password: hashedPassword,
      name: 'Budi Pratama',
      phone: '081234567894',
      address: 'Jakarta Timur',
      kota: 'Jakarta Timur',
      role: 'COURIER',
      isActive: true,
      referralCode: 'COUR002'
    }
  })
  console.log('✅ Courier 2 created:', courier2.email)

  // Create Warehouse User
  const warehouse = await prisma.user.upsert({
    where: { email: 'warehouse@jelantahgo.com' },
    update: {},
    create: {
      email: 'warehouse@jelantahgo.com',
      password: hashedPassword,
      name: 'Warehouse Manager',
      phone: '081234567895',
      address: 'Gudang Pusat Jakarta',
      kota: 'Jakarta Pusat',
      role: 'WAREHOUSE',
      isActive: true,
      referralCode: 'WARE001'
    }
  })
  console.log('✅ Warehouse user created:', warehouse.email)

  // Create sample pickups
  const pickup1 = await prisma.pickup.create({
    data: {
      customerId: customer1.id,
      courierId: courier.id,
      status: 'COMPLETED',
      scheduledDate: new Date('2024-01-10T10:00:00'),
      actualDate: new Date('2024-01-10T10:30:00'),
      volume: 25,
      pricePerLiter: 5000,
      totalPrice: 125000,
      courierFee: 25000,
      affiliateFee: 0,
      latitude: -6.200000,
      longitude: 106.816666
    }
  })
  console.log('✅ Sample pickup 1 created')

  const pickup2 = await prisma.pickup.create({
    data: {
      customerId: customer2.id,
      courierId: courier.id,
      status: 'PENDING',
      scheduledDate: new Date('2024-01-15T14:00:00'),
      volume: 30,
      pricePerLiter: 5000,
      totalPrice: 150000,
      courierFee: 30000,
      affiliateFee: 0,
      latitude: -6.200000,
      longitude: 106.816666
    }
  })
  console.log('✅ Sample pickup 2 created')

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Demo Accounts:')
  console.log('Admin: admin@jelantahgo.com / demo123')
  console.log('Customer: customer1@jelantahgo.com / demo123')
  console.log('Courier: courier@jelantahgo.com / demo123')
  console.log('Warehouse: warehouse@jelantahgo.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
