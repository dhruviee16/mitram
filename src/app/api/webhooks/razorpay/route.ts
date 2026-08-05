import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { confirmPaymentFromWebhook } from "@/server/services/paymentService";

// Razorpay webhook events (https://razorpay.com/docs/webhooks/) — authenticated
// via HMAC-SHA256 over the raw request body using a webhook secret configured
// separately in the Razorpay dashboard (Settings > Webhooks). This is NOT the
// same secret or signature scheme as the checkout verification in
// /api/payments/verify — that one signs `order_id|payment_id` with the API
// key secret; this one signs the entire raw payload with the webhook secret.
export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id) {
      await confirmPaymentFromWebhook(payment.order_id, payment.id);
    }
  }

  return NextResponse.json({ received: true });
}
