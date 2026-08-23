import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Note: user accounts are NOT seeded here. Accounts must be created
// through /login (Create Account) so they get a real Supabase auth
// identity — the first account created automatically becomes ADMIN.

const sampleProducts = [
  {
    name: 'Velvet Rose Lipstick',
    category: 'Makeup' as const,
    sku: 'BC-LIP-101',
    costPrice: 8.5,
    sellingPrice: 24.0,
    stockQuantity: 42,
  },
  {
    name: 'Hydrating Glow Serum',
    category: 'Skincare' as const,
    sku: 'BC-SER-204',
    costPrice: 14.0,
    sellingPrice: 38.0,
    stockQuantity: 30,
  },
  {
    name: 'Citrus Bloom Eau de Parfum',
    category: 'Fragrance' as const,
    sku: 'BC-FRA-310',
    costPrice: 22.0,
    sellingPrice: 65.0,
    stockQuantity: 4,
  },
  {
    name: 'Gentle Oat Milk Cleanser',
    category: 'Cleanser' as const,
    sku: 'BC-CLN-115',
    costPrice: 6.0,
    sellingPrice: 19.0,
    stockQuantity: 55,
  },
  {
    name: 'Matte Silk Foundation',
    category: 'Makeup' as const,
    sku: 'BC-FND-220',
    costPrice: 11.0,
    sellingPrice: 32.0,
    stockQuantity: 3,
  },
];

function statusForQuantity(qty: number): 'In_Stock' | 'Low_Stock' {
  return qty <= 5 ? 'Low_Stock' : 'In_Stock';
}

async function main() {
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, storeName: 'Beauty Cosmo Retail', taxRate: 8.0, currencySymbol: '$' },
  });
  console.log('Store settings ready.');

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: { ...product, status: statusForQuantity(product.stockQuantity) },
    });
  }
  console.log(`Seeded ${sampleProducts.length} sample products.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
