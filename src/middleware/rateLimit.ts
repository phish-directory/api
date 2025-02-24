// import rateLimit from "express-rate-limit";

// // Create a rate limiter factory
// const createRateLimiter = (windowMs: number, maxRequests: number) => {
//   return rateLimit({
//     windowMs,
//     max: maxRequests,
//     message: {
//       error: "Too many requests, please try again later.",
//       retryAfter: windowMs / 1000,
//     },
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   });
// };

// // default rate limiter for all endpoints
// const defaultRateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 15 minutes, 100 requests

// // Create specific rate limiters for different endpoints
// const loginRateLimiter = createRateLimiter(15 * 60 * 1000, 5); // 15 minutes, 5 requests
// const signupRateLimiter = createRateLimiter(15 * 60 * 1000, 5); // 15 minutes, 5 requests
// const passwordResetRateLimiter = createRateLimiter(15 * 60 * 1000, 5); // 15 minutes, 5 requests

// export default defaultRateLimiter;
// export {
//   defaultRateLimiter,
//   loginRateLimiter,
//   passwordResetRateLimiter,
//   signupRateLimiter,
// };
