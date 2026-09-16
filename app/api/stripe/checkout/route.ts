import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
  });
}

const TIER_PRODUCTS: Record<string, string | undefined> = {
  audit: process.env.NEXT_PUBLIC_STRIPE_AUDIT_PRODUCT_ID,
  lite: process.env.NEXT_PUBLIC_STRIPE_LITE_PRODUCT_ID,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,
  partner: process.env.NEXT_PUBLIC_STRIPE_PARTNER_PRODUCT_ID,
};

export async function GET(request: NextRequest) {
  try {
    const tier = request.nextUrl.searchParams.get('tier') || '';
    const priceId = TIER_PRODUCTS[tier];

    if (!priceId) {
      return NextResponse.json(
        { error: `Unknown or unconfigured tier: ${tier}` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&product=${tier}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        productType: tier,
      },
      billing_address_collection: 'required',
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout session URL');
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error('Stripe checkout GET error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { priceId, productType, userId } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&product=${productType}`,
      cancel_url: `${appUrl}/pricing`,
      customer_email: undefined, // User email can be added here if available
      metadata: {
        userId,
        productType,
      },
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
