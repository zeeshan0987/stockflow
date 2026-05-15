/**
 * StockFlow seed – creates a demo org + user + sample products.
 * Run: node src/seed.js
 * Login: demo@stockflow.dev / password123
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

async function main() {
  console.log('🌱 Seeding StockFlow demo data...');

  const org = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: { id: 'demo-org', name: 'Demo Store', defaultLowStockThreshold: 5 },
  });

  const hash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@stockflow.dev' },
    update: {},
    create: { email: 'demo@stockflow.dev', passwordHash: hash, organizationId: org.id },
  });

  const products = [
    { name: 'Blue T-Shirt (M)', sku: 'TSH-BLU-M', quantityOnHand: 3, sellingPrice: 29.99, costPrice: 10, lowStockThreshold: 5 },
    { name: 'Black Jeans (32)', sku: 'JNS-BLK-32', quantityOnHand: 12, sellingPrice: 79.99, costPrice: 30 },
    { name: 'White Sneakers (10)', sku: 'SNK-WHT-10', quantityOnHand: 0, sellingPrice: 109.99, costPrice: 45, lowStockThreshold: 3 },
    { name: 'Canvas Tote Bag', sku: 'BAG-CVS-001', quantityOnHand: 24, sellingPrice: 19.99, costPrice: 5 },
    { name: 'Ceramic Mug', sku: 'MUG-CER-001', quantityOnHand: 2, sellingPrice: 14.99, costPrice: 4, lowStockThreshold: 10 },
    { name: 'Wireless Earbuds', sku: 'ELEC-WE-001', quantityOnHand: 7, sellingPrice: 59.99, costPrice: 22 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { organizationId_sku: { organizationId: org.id, sku: p.sku } },
      update: {},
      create: { organizationId: org.id, ...p },
    });
  }

  console.log('✅ Seed complete!');
  console.log(`   Org:  ${org.name}`);
  console.log(`   User: ${user.email} / password123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
