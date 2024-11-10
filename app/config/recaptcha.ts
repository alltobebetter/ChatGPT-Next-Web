export const RECAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  enabled: process.env.RECAPTCHA_ENABLED === 'true',
  scoreThreshold: {
    low: 0.3,
    high: 0.7
  }
};
