const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../prisma');

router.use(authenticate);

// ── GET /api/dashboard ───────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { organizationId } = req.user;

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultLowStockThreshold: true },
    });
    const orgDefault = org?.defaultLowStockThreshold ?? 5;

    // All active products
    const products = await prisma.product.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true, name: true, sku: true,
        quantityOnHand: true, lowStockThreshold: true, sellingPrice: true,
      },
    });

    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

    const lowStockItems = products
      .map((p) => ({ ...p, effectiveThreshold: p.lowStockThreshold ?? orgDefault }))
      .filter((p) => p.quantityOnHand <= p.effectiveThreshold)
      .sort((a, b) => a.quantityOnHand - b.quantityOnHand); // most critical first

    res.json({
      totalProducts,
      totalUnits,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
