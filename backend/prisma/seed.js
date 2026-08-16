const { PrismaPg } = require('@prisma/adapter-pg');
const {
  PrismaClient,
  CategoryType,
  Role,
  UserStatus,
  Language,
  Currency,
} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Database seed failed: DATABASE_URL is not configured.');
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

// ======================================================
// DEFAULT CATEGORIES
// ======================================================

const defaultCategories = [
  {
    key: 'income_salary',
    name: 'Salary',
    type: CategoryType.INCOME,
    icon: 'briefcase',
  },
  {
    key: 'income_business',
    name: 'Business',
    type: CategoryType.INCOME,
    icon: 'store',
  },
  {
    key: 'income_freelance',
    name: 'Freelance',
    type: CategoryType.INCOME,
    icon: 'laptop',
  },
  {
    key: 'income_gift',
    name: 'Gift',
    type: CategoryType.INCOME,
    icon: 'gift',
  },
  {
    key: 'income_other',
    name: 'Other Income',
    type: CategoryType.INCOME,
    icon: 'plus-circle',
  },
  {
    key: 'expense_food',
    name: 'Food',
    type: CategoryType.EXPENSE,
    icon: 'utensils',
  },
  {
    key: 'expense_transport',
    name: 'Transport',
    type: CategoryType.EXPENSE,
    icon: 'car',
  },
  {
    key: 'expense_rent',
    name: 'Rent',
    type: CategoryType.EXPENSE,
    icon: 'home',
  },
  {
    key: 'expense_bills',
    name: 'Bills',
    type: CategoryType.EXPENSE,
    icon: 'receipt',
  },
  {
    key: 'expense_education',
    name: 'Education',
    type: CategoryType.EXPENSE,
    icon: 'book-open',
  },
  {
    key: 'expense_health',
    name: 'Health',
    type: CategoryType.EXPENSE,
    icon: 'heart-pulse',
  },
  {
    key: 'expense_shopping',
    name: 'Shopping',
    type: CategoryType.EXPENSE,
    icon: 'shopping-bag',
  },
  {
    key: 'expense_family',
    name: 'Family',
    type: CategoryType.EXPENSE,
    icon: 'users',
  },
  {
    key: 'expense_entertainment',
    name: 'Entertainment',
    type: CategoryType.EXPENSE,
    icon: 'clapperboard',
  },
  {
    key: 'expense_other',
    name: 'Other',
    type: CategoryType.EXPENSE,
    icon: 'more-horizontal',
  },
];

// ======================================================
// ADMIN CONFIGURATION
// ======================================================

const ADMIN_EMAIL = 'asadisse12@gmail.com';
const ADMIN_PASSWORD = 'Hooyo@mcn123';
const ADMIN_NAME = ' Admin';

// ======================================================
// MAIN SEED
// ======================================================

async function main() {
  console.log('🌱 Starting Qorshe database seed...\n');

  // ====================================================
  // 1. CREATE / UPDATE ADMIN
  // ====================================================

  console.log('👤 Creating Admin account...');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: ADMIN_EMAIL,
    },

    update: {
      name: ADMIN_NAME,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      preferredLanguage: Language.SO,
      preferredCurrency: Currency.USD,
    },

    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      preferredLanguage: Language.SO,
      preferredCurrency: Currency.USD,
    },
  });

  console.log('✅ Admin account ready');
  console.log(`   ID:    ${admin.id}`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`   Status: ${admin.status}\n`);

  // ====================================================
  // 2. CREATE / UPDATE DEFAULT CATEGORIES
  // ====================================================

  console.log('📂 Seeding default categories...');

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        key: category.key,
      },

      update: {
        name: category.name,
        type: category.type,
        icon: category.icon,
        isDefault: true,
        isActive: true,
        userId: null,
      },

      create: {
        ...category,
        isDefault: true,
        isActive: true,
        userId: null,
      },
    });
  }

  console.log(
    `✅ Seeded ${defaultCategories.length} default categories.\n`
  );

  // ====================================================
  // 3. SUMMARY
  // ====================================================

  console.log('========================================');
  console.log('🎉 QORSHE SEED COMPLETED SUCCESSFULLY');
  console.log('========================================');
  console.log('');
  console.log('Admin Login:');
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log('');
  console.log(`Categories: ${defaultCategories.length}`);
  console.log('');
  console.log('⚠️ Change the admin password after first login.');
  console.log('========================================');
}

// ======================================================
// RUN SEED
// ======================================================

main()
  .catch((error) => {
    console.error('\n❌ Database seed failed:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });