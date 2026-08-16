import crypto from 'crypto';

/**
 * Verifies Whop webhook signature.
 * 
 * Supports:
 * 1. Standard HMAC-SHA256 signatures (`whop-signature` or `x-whop-signature`)
 * 2. Svix/Standard Webhook signatures (`webhook-signature`, `webhook-id`, `webhook-timestamp`)
 * 3. Secret keys with prefixes `ws_...`, `whsec_...` or raw strings.
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

  // Case 1: Standard HMAC header (whop-signature / x-whop-signature)
  if (whopSignature) {
    const expectedSignatureHex = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const cleanSignature = whopSignature.replace(/^sha256=/, '');
    try {
      if (
        cleanSignature.length === expectedSignatureHex.length &&
        crypto.timingSafeEqual(
          Buffer.from(cleanSignature, 'utf-8'),
          Buffer.from(expectedSignatureHex, 'utf-8')
        )
      ) {
        return { isValid: true };
      }
    } catch {
      // ignore
    }

    return { isValid: false, reason: 'HMAC signature mismatch' };
  }

  // Case 2: Svix / Standard Webhooks (webhook-signature + webhook-id + webhook-timestamp)
  if (svixSignature && svixId && svixTimestamp) {
    const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
    
    // Whop secrets can be "whsec_...", "ws_..." or raw strings
    let secretKey = secret;
    if (secret.startsWith('whsec_')) {
      secretKey = secret.substring(6);
    } else if (secret.startsWith('ws_')) {
      secretKey = secret.substring(3);
    }

    // Try verifying with base64 decoded key first (Svix standard), then fallback to utf-8
    const candidateKeys: Buffer[] = [];
    try {
      candidateKeys.push(Buffer.from(secretKey, 'base64'));
    } catch {
      // ignore
    }
    candidateKeys.push(Buffer.from(secret, 'utf-8'));
    candidateKeys.push(Buffer.from(secretKey, 'utf-8'));

    const passedSignatures = svixSignature
      .split(' ')
      .map((s) => s.split(',')[1] || s);

    for (const key of candidateKeys) {
      const expectedBase64 = crypto
        .createHmac('sha256', key)
        .update(signedPayload)
        .digest('base64');

      for (const sig of passedSignatures) {
        try {
          if (
            sig.length === expectedBase64.length &&
            crypto.timingSafeEqual(
              Buffer.from(sig, 'utf-8'),
              Buffer.from(expectedBase64, 'utf-8')
            )
          ) {
            return { isValid: true };
          }
        } catch {
          // continue
        }
      }
    }

    return { isValid: false, reason: 'Svix webhook signature mismatch' };
  }

  // If secret is set but no matching signature header was found
  return { isValid: false, reason: 'Missing webhook signature header (whop-signature or webhook-signature).' };
}
