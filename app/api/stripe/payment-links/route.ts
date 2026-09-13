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

export async function POST(request: NextRequest) {
  try {
    const { productId, tierName } = await request.json();

    if (!productId || !tierName) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, tierName' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: productId,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${appUrl}/payment-success?tier=${tierName}`,
        },
      },
      submit_type: 'pay',
      billing_address_collection: 'required',
    });

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.url,
      tierName,
    });
  } catch (error) {
    console.error('Payment link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const tiers = [
      { productId: process.env.NEXT_PUBLIC_STRIPE_AUDIT_PRODUCT_ID, name: 'audit' },
      { productId: process.env.NEXT_PUBLIC_STRIPE_LITE_PRODUCT_ID, name: 'lite' },
      { productId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID, name: 'pro' },
      { productId: process.env.NEXT_PUBLIC_STRIPE_PARTNER_PRODUCT_ID, name: 'partner' },
    ];

    const links: Record<string, string> = {};

    for (const tier of tiers) {
      if (!tier.productId) continue;

      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: tier.productId,
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${appUrl}/payment-success?tier=${tier.name}`,
          },
        },
        submit_type: 'pay',
        billing_address_collection: 'required',
      });

      links[tier.name] = paymentLink.url;
    }

    return NextResponse.json({
      success: true,
      links,
      message: 'Payment links created successfully. Save these for your environment variables or site config.',
    });
  } catch (error) {
    console.error('Bulk payment link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment links', details: String(error) },
      { status: 500 }
    );
  }
}
