import { rateLimit } from 'express-rate-limit';

// Counters are kept in server memory: they reset when the server restarts.
function limiter(minutes, limit, message, options = {}) {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
    ...options,
  });
}

export const apiLimiter = limiter(15, 600, 'Too many requests. Please slow down and try again.');
export const loginLimiter = limiter(15, 10, 'Too many login attempts. Please try again in 15 minutes.', {
  skipSuccessfulRequests: true,
});
export const registerLimiter = limiter(60, 10, 'Too many accounts created from this connection. Please try again later.');
export const orderLimiter = limiter(60, 20, 'Too many orders from this connection. Please try again later.');
export const trackLimiter = limiter(15, 30, 'Too many tracking attempts. Please try again in 15 minutes.');
export const reviewLimiter = limiter(60, 10, 'Too many reviews from this connection. Please try again later.');
export const newsletterLimiter = limiter(60, 10, 'Too many attempts. Please try again later.');
export const messageLimiter = limiter(60, 5, 'Too many messages. Please try again later.');