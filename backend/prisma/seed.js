const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, CategoryType } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Database seed failed: DATABASE_URL is not configured.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const defaultCategories = [
  { key: 'income_salary', name: 'Salary', type: CategoryType.INCOME, icon: 'briefcase' },
  { key: 'income_business', name: 'Business', type: CategoryType.INCOME, icon: 'store' },
  { key: 'income_freelance', name: 'Freelance', type: CategoryType.INCOME, icon: 'laptop' },
  { key: 'income_gift', name: 'Gift', type: CategoryType.INCOME, icon: 'gift' },
  { key: 'income_other', name: 'Other Income', type: CategoryType.INCOME, icon: 'plus-circle' },
  { key: 'expense_food', name: 'Food', type: CategoryType.EXPENSE, icon: 'utensils' },
  { key: 'expense_transport', name: 'Transport', type: CategoryType.EXPENSE, icon: 'car' },
  { key: 'expense_rent', name: 'Rent', type: CategoryType.EXPENSE, icon: 'home' },
  { key: 'expense_bills', name: 'Bills', type: CategoryType.EXPENSE, icon: 'receipt' },
  { key: 'expense_education', name: 'Education', type: CategoryType.EXPENSE, icon: 'book-open' },
  { key: 'expense_health', name: 'Health', type: CategoryType.EXPENSE, icon: 'heart-pulse' },
  { key: 'expense_shopping', name: 'Shopping', type: CategoryType.EXPENSE, icon: 'shopping-bag' },
  { key: 'expense_family', name: 'Family', type: CategoryType.EXPENSE, icon: 'users' },
  { key: 'expense_entertainment', name: 'Entertainment', type: CategoryType.EXPENSE, icon: 'clapperboard' },
  { key: 'expense_other', name: 'Other', type: CategoryType.EXPENSE, icon: 'more-horizontal' },
];

async function main() {
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: { name: category.name, type: category.type, icon: category.icon, isDefault: true, isActive: true, userId: null },
      create: { ...category, isDefault: true, isActive: true },
    });
  }
  console.log(`Seeded ${defaultCategories.length} default categories.`);
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
