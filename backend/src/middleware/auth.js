const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

/**
 * Verifies the Bearer JWT and attaches { userId, organizationId } to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, organizationId: true },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = { userId: user.id, organizationId: user.organizationId };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(err);
  }
}

module.exports = { authenticate };
