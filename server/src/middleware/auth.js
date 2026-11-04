import jwt from 'jsonwebtoken';

function adminSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is missing in server/.env');
  return secret;
}

export function signAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, name: admin.name, username: admin.username, role: 'admin' },
    adminSecret(),
    { expiresIn: '12h', algorithm: 'HS256' }
  );
}

// Admin routes accept only tokens signed with JWT_SECRET that carry role "admin".
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    const payload = jwt.verify(token, adminSecret(), { algorithms: ['HS256'] });
    if (payload.role !== 'admin') return res.status(401).json({ error: 'Login required' });
    req.admin = payload;
    return next();
  } catch (err) {
    if (['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return next(err);
  }
}