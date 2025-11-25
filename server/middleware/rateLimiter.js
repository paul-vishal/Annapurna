// Simple in-memory rate limiter to prevent API abuse and reduce costs
// In production, use Redis for distributed rate limiting

const rateLimitStore = new Map();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 5, // 5 requests per window
    message = 'Too many requests, please try again later.'
  } = options;

  return (req, res, next) => {
    const userId = req.user?._id?.toString();
    if (!userId) {
      return next(); // Skip rate limiting if no user (shouldn't happen with protect middleware)
    }

    const key = `${userId}:${req.path}`;
    const now = Date.now();
    const userLimit = rateLimitStore.get(key);

    if (!userLimit) {
      // First request
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (now > userLimit.resetTime) {
      // Window expired, reset
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      return res.status(429).json({
        message: message,
        retryAfter: `${retryAfter} seconds`
      });
    }

    // Increment count
    userLimit.count++;
    return next();
  };
};

module.exports = rateLimiter;
