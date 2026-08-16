import crypto from 'crypto';

/**
 * Verifies Whop webhook signature.
 * 
 * Supports both:
 * 1. Standard HMAC-SHA256 signatures (`whop-signature` or `x-whop-signature`)
 * 2. Svix/Standard Webhook signatures (`webhook-signature`, `webhook-id`, `webhook-timestamp`)
 */
export function verifyWhopWebhookSignature(
  rawBody: string,
  headers: Headers
): { isValid: boolean; reason?: string } {
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  // If no secret configured in development, allow for testing but warn
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { isValid: false, reason: 'WHOP_WEBHOOK_SECRET is not configured on server.' };
    }
    return { isValid: true, reason: 'Development mode: WHOP_WEBHOOK_SECRET not set, signature check bypassed.' };
  }

  // Check headers
  const whopSignature = headers.get('whop-signature') || headers.get('x-whop-signature');
  const svixSignature = headers.get('webhook-signature');
  const svixId = headers.get('webhook-id');
  const svixTimestamp = headers.get('webhook-timestamp');

  // Case 1: Standard HMAC header
  if (whopSignature) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const cleanSignature = whopSignature.replace(/^sha256=/, '');
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

    return isMatch
      ? { isValid: true }
      : { isValid: false, reason: 'HMAC signature mismatch' };
  }

  // Case 2: Svix format (v1,signature)
  if (svixSignature && svixId && svixTimestamp) {
    const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
    const cleanSecret = secret.startsWith('whsec_') ? secret.substring(6) : secret;
    const secretBuffer = Buffer.from(cleanSecret, 'base64');

    const expectedSignature = crypto
      .createHmac('sha256', secretBuffer)
      .update(signedPayload)
      .digest('base64');

    // svixSignature can contain multiple comma-separated signatures (e.g. "v1,signature1 v1,signature2")
    const passedSignatures = svixSignature
      .split(' ')
      .map((s) => s.split(',')[1] || s);

    const isMatch = passedSignatures.some((sig) => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(sig, 'utf-8'),
          Buffer.from(expectedSignature, 'utf-8')
        );
      } catch {
        return false;
      }
    });

    return isMatch
      ? { isValid: true }
      : { isValid: false, reason: 'Svix signature mismatch' };
  }

  // If secret is set but no matching signature header was found
  return { isValid: false, reason: 'Missing webhook signature header (whop-signature or webhook-signature).' };
}
