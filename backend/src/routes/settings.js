const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const prisma = require('../prisma');

router.use(authenticate);

// ── GET /api/settings ────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      select: { id: true, name: true, defaultLowStockThreshold: true },
    });
    res.json(org);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/settings ──────────────────────
router.patch(
  '/',
  [body('defaultLowStockThreshold').isInt({ min: 0 }).withMessage('Must be a non-negative integer')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const updated = await prisma.organization.update({
        where: { id: req.user.organizationId },
        data: { defaultLowStockThreshold: Number(req.body.defaultLowStockThreshold) },
        select: { id: true, name: true, defaultLowStockThreshold: true },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
