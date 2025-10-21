import { PrismaClient, Role } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you don't want to clear)
  console.log('🗑️  Cleaning database...');
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.address.deleteMany();
  await prisma.paymentAccount.deleteMany();
  await prisma.claimPayee.deleteMany();
  await prisma.user.deleteMany();

  // Create users with different roles
  console.log('👤 Creating users...');

  const hashedPassword = await bcrypt.hash('P@ssw0rd!123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      fullName: 'Super Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Created SUPER_ADMIN:', superAdmin.username);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Created ADMIN:', admin.username);

  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      email: 'manager@example.com',
      password: hashedPassword,
      fullName: 'Manager User',
      role: Role.MANAGER,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Created MANAGER:', manager.username);

  const user = await prisma.user.create({
    data: {
      username: 'user',
      email: 'user@example.com',
      password: hashedPassword,
      fullName: 'Regular User',
      role: Role.USER,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Created USER:', user.username);

  const viewer = await prisma.user.create({
    data: {
      username: 'viewer',
      email: 'viewer@example.com',
      password: hashedPassword,
      fullName: 'Viewer User',
      role: Role.VIEWER,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Created VIEWER:', viewer.username);

  // Create sample claim payees
  console.log('\n💼 Creating claim payees...');

  const claimPayee1 = await prisma.claimPayee.create({
    data: {
      claimPayeeName: 'ABC Insurance Corporation',
      claimPayeeCode: 'ABC001',
      claimPayeeType: 'Corporate',
      legalEntityType: 'LLC',
      taxId: '123456789',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+84123456789',
      email: 'john.smith@abc-insurance.com',
      notes: 'Premier insurance provider',
      createdBy: admin.id,
      updatedBy: admin.id,
      paymentAccounts: {
        create: [
          {
            accountName: 'Primary Operating Account',
            accountNumber: '1234567890',
            accountType: 'checking',
            paymentMethod: 'ACH',
            bankName: 'Vietcombank',
            routingNumber: '123456',
            isPrimary: true,
            isActive: true,
          },
          {
            accountName: 'Secondary Wire Account',
            accountNumber: '0987654321',
            accountType: 'savings',
            paymentMethod: 'Wire',
            bankName: 'Techcombank',
            routingNumber: '654321',
            swiftCode: 'SWIFT123',
            isPrimary: false,
            isActive: true,
          },
        ],
      },
      addresses: {
        create: [
          {
            type: 'billing',
            street: '123 Main Street',
            street2: 'Suite 100',
            city: 'Da Nang',
            state: 'Da Nang City',
            postalCode: '550000',
            country: 'Vietnam',
            latitude: 16.0544,
            longitude: 108.2022,
            isPrimary: true,
            isActive: true,
          },
          {
            type: 'mailing',
            street: '456 Business Ave',
            city: 'Ho Chi Minh',
            state: 'Ho Chi Minh City',
            postalCode: '700000',
            country: 'Vietnam',
            isPrimary: false,
            isActive: true,
          },
        ],
      },
    },
  });
  console.log('✅ Created claim payee:', claimPayee1.claimPayeeName);

  const claimPayee2 = await prisma.claimPayee.create({
    data: {
      claimPayeeName: 'XYZ Medical Services',
      claimPayeeCode: 'XYZ002',
      claimPayeeType: 'Medical',
      legalEntityType: 'Corporation',
      taxId: '987654321',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+84987654321',
      email: 'jane.doe@xyz-medical.com',
      notes: 'Leading medical service provider',
      createdBy: manager.id,
      updatedBy: manager.id,
      paymentAccounts: {
        create: [
          {
            accountName: 'Medical Claims Account',
            accountNumber: '5555666677',
            accountType: 'checking',
            paymentMethod: 'ACH',
            bankName: 'BIDV',
            routingNumber: '789012',
            isPrimary: true,
            isActive: true,
          },
        ],
      },
      addresses: {
        create: [
          {
            type: 'billing',
            street: '789 Healthcare Blvd',
            city: 'Hanoi',
            state: 'Hanoi',
            postalCode: '100000',
            country: 'Vietnam',
            isPrimary: true,
            isActive: true,
          },
        ],
      },
    },
  });
  console.log('✅ Created claim payee:', claimPayee2.claimPayeeName);

  const claimPayee3 = await prisma.claimPayee.create({
    data: {
      claimPayeeName: 'Global Property Solutions',
      claimPayeeCode: 'GPS003',
      claimPayeeType: 'Property',
      legalEntityType: 'Partnership',
      taxId: '456789123',
      firstName: 'Michael',
      lastName: 'Johnson',
      phone: '+84912345678',
      email: 'michael@gps-property.com',
      createdBy: admin.id,
      updatedBy: admin.id,
      paymentAccounts: {
        create: [
          {
            accountName: 'Property Claims',
            accountNumber: '9998887776',
            accountType: 'checking',
            paymentMethod: 'Check',
            bankName: 'ACB Bank',
            isPrimary: true,
            isActive: true,
          },
        ],
      },
      addresses: {
        create: [
          {
            type: 'billing',
            street: '321 Property Lane',
            city: 'Da Nang',
            state: 'Da Nang City',
            postalCode: '550000',
            country: 'Vietnam',
            isPrimary: true,
            isActive: true,
          },
        ],
      },
    },
  });
  console.log('✅ Created claim payee:', claimPayee3.claimPayeeName);

  // Create some audit logs
  console.log('\n📝 Creating audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      username: admin.username,
      action: 'CREATE',
      entity: 'ClaimPayee',
      entityId: claimPayee1.id,
      description: 'Created claim payee via seed',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('==========================================');
  console.log('SUPER_ADMIN - username: superadmin, password: P@ssw0rd!123');
  console.log('ADMIN       - username: admin, password: P@ssw0rd!123');
  console.log('MANAGER     - username: manager, password: P@ssw0rd!123');
  console.log('USER        - username: user, password: P@ssw0rd!123');
  console.log('VIEWER      - username: viewer, password: P@ssw0rd!123');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });