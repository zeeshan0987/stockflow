const router = require('express').Router();
const { body, query, param, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const prisma = require('../prisma');

// All product routes require auth
router.use(authenticate);

// ── Helper: resolve effective low-stock threshold ─
async function getEffectiveThreshold(product, orgId) {
  if (product.lowStockThreshold != null) return product.lowStockThreshold;
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { defaultLowStockThreshold: true } });
  return org?.defaultLowStockThreshold ?? 5;
}

function isLowStock(qty, threshold) {
  return qty <= threshold;
}

// ── GET /api/products ────────────────────────
// Query params: search (name or SKU), page, limit
router.get('/', async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      organizationId: req.user.organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    // Attach org default for low-stock flag
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { defaultLowStockThreshold: true },
    });
    const orgDefault = org?.defaultLowStockThreshold ?? 5;

    const enriched = products.map((p) => {
      const threshold = p.lowStockThreshold ?? orgDefault;
      return { ...p, effectiveThreshold: threshold, isLowStock: isLowStock(p.quantityOnHand, threshold) };
    });

    res.json({ data: enriched, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/:id ────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId, deletedAt: null },
      include: { stockAdjustments: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { defaultLowStockThreshold: true },
    });
    const threshold = product.lowStockThreshold ?? org?.defaultLowStockThreshold ?? 5;

    res.json({ ...product, effectiveThreshold: threshold, isLowStock: isLowStock(product.quantityOnHand, threshold) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/products ───────────────────────
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('quantityOnHand').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('costPrice').optional({ nullable: true }).isFloat({ min: 0 }),
    body('sellingPrice').optional({ nullable: true }).isFloat({ min: 0 }),
    body('lowStockThreshold').optional({ nullable: true }).isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { name, sku, description, quantityOnHand = 0, costPrice, sellingPrice, lowStockThreshold } = req.body;

      const product = await prisma.product.create({
        data: {
          organizationId: req.user.organizationId,
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          description: description?.trim() || null,
          quantityOnHand: Number(quantityOnHand),
          costPrice: costPrice != null ? Number(costPrice) : null,
          sellingPrice: sellingPrice != null ? Number(sellingPrice) : null,
          lowStockThreshold: lowStockThreshold != null ? Number(lowStockThreshold) : null,
        },
      });

      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/products/:id ──────────────────
router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('sku').optional().trim().notEmpty(),
    body('quantityOnHand').optional().isInt({ min: 0 }),
    body('costPrice').optional({ nullable: true }).isFloat({ min: 0 }),
    body('sellingPrice').optional({ nullable: true }).isFloat({ min: 0 }),
    body('lowStockThreshold').optional({ nullable: true }).isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      // Confirm ownership
      const existing = await prisma.product.findFirst({
        where: { id: req.params.id, organizationId: req.user.organizationId, deletedAt: null },
      });
      if (!existing) return res.status(404).json({ error: 'Product not found.' });

      const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(sku !== undefined && { sku: sku.trim().toUpperCase() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(quantityOnHand !== undefined && { quantityOnHand: Number(quantityOnHand) }),
          ...(costPrice !== undefined && { costPrice: costPrice != null ? Number(costPrice) : null }),
          ...(sellingPrice !== undefined && { sellingPrice: sellingPrice != null ? Number(sellingPrice) : null }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold: lowStockThreshold != null ? Number(lowStockThreshold) : null }),
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/products/:id ─────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ error: 'Product not found.' });

    // Soft delete
    await prisma.product.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/products/:id/adjust-stock ──────
// Body: { delta: number, note?: string }
router.post(
  '/:id/adjust-stock',
  [
    body('delta').isInt().withMessage('delta must be a non-zero integer'),
    body('note').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { delta, note } = req.body;

      const product = await prisma.product.findFirst({
        where: { id: req.params.id, organizationId: req.user.organizationId, deletedAt: null },
      });
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      const newQty = product.quantityOnHand + Number(delta);
      if (newQty < 0) return res.status(400).json({ error: 'Stock cannot go below 0.' });

      const [updated] = await prisma.$transaction([
        prisma.product.update({ where: { id: product.id }, data: { quantityOnHand: newQty } }),
        prisma.stockAdjustment.create({ data: { productId: product.id, delta: Number(delta), note: note || null } }),
      ]);

      res.json({ product: updated, adjustment: { delta, note } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
