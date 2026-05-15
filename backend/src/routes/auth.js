const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');

// ── Helper: sign JWT ─────────────────────────
function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ── POST /api/auth/signup ────────────────────
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('organizationName').trim().notEmpty().withMessage('Organization name required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { email, password, organizationName } = req.body;

      // Check duplicate email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already in use.' });

      const passwordHash = await bcrypt.hash(password, 12);

      // Create org + user in one transaction
      const user = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: organizationName.trim() },
        });
        return tx.user.create({
          data: { email, passwordHash, organizationId: org.id },
          include: { organization: { select: { id: true, name: true, defaultLowStockThreshold: true } } },
        });
      });

      const token = signToken(user.id);
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          organization: user.organization,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ─────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { organization: { select: { id: true, name: true, defaultLowStockThreshold: true } } },
      });

      const valid = user && (await bcrypt.compare(password, user.passwordHash));
      if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

      const token = signToken(user.id);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          organization: user.organization,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/auth/me ─────────────────────────
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        organization: { select: { id: true, name: true, defaultLowStockThreshold: true } },
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
