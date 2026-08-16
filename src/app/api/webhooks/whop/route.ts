import { NextRequest, NextResponse } from 'next/server';
import { verifyWhopWebhookSignature } from '@/lib/whop/verify-signature';
import { processWhopWebhook } from '@/lib/whop/process-webhook';

export const dynamic = 'force-dynamic';

/**
 * Health check / Status endpoint for Whop Webhook
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'OPAL OS Whop Webhook Gateway',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Main Whop Webhook Listener
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Verify signature
    const verification = verifyWhopWebhookSignature(rawBody, req.headers);
    if (!verification.isValid) {
      console.warn('Whop webhook signature verification failed:', verification.reason);
      return NextResponse.json(
        { error: 'Invalid webhook signature', details: verification.reason },
        { status: 401 }
      );
    }

    // 2. Parse payload
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    // 3. Process event
    const result = await processWhopWebhook(event);

    return NextResponse.json({
      received: true,
      processed: result.success,
      action: result.action,
      plan: result.plan,
      userMatched: result.userMatched,
    });
  } catch (error: any) {
    console.error('Unhandled Whop webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook', message: error.message },
      { status: 500 }
    );
  }
}
