import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const productType = session.metadata?.productType as 'audit' | 'workshop' | undefined;

        if (!userId || !productType) {
          console.error('Missing userId or productType in session metadata');
          break;
        }

        // Update customer record in Supabase
        const { error } = await supabase
          .from('customers')
          .update({
            has_paid: true,
            product_type: productType,
            payment_date: new Date().toISOString(),
            stripe_customer_id: session.customer as string,
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Failed to update customer:', error);
          return NextResponse.json(
            { error: 'Failed to update customer payment status' },
            { status: 500 }
          );
        }

        console.log(`Payment confirmed for user ${userId}, product: ${productType}`);
        break;
      }

      case 'checkout.session.expired': {
        console.log('Checkout session expired');
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
