// Mapping of tier names to their product IDs
const TIER_PRODUCTS: Record<string, string> = {
  audit: process.env.NEXT_PUBLIC_STRIPE_AUDIT_PRODUCT_ID || '',
  lite: process.env.NEXT_PUBLIC_STRIPE_LITE_PRODUCT_ID || '',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID || '',
  partner: process.env.NEXT_PUBLIC_STRIPE_PARTNER_PRODUCT_ID || '',
};

// Cache for payment links (in a production app, use Redis or similar)
const paymentLinksCache: Map<string, { url: string; timestamp: number }> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getPaymentLink(tier: 'audit' | 'lite' | 'pro' | 'partner'): Promise<string> {
  const cached = paymentLinksCache.get(tier);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  try {
    const response = await fetch('/api/stripe/payment-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: TIER_PRODUCTS[tier],
        tierName: tier,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment link: ${response.statusText}`);
    }

    const data = await response.json();
    const url = data.paymentLink;

    // Cache the link
    paymentLinksCache.set(tier, { url, timestamp: Date.now() });
    return url;
  } catch (error) {
    console.error(`Error fetching payment link for ${tier}:`, error);
    // Fallback to checkout endpoint if payment links fail
    return `/api/stripe/checkout?tier=${tier}`;
  }
}

export const PAYMENT_LINKS = {
  AUDIT: 'audit',
  LITE: 'lite',
  PRO: 'pro',
  PARTNER: 'partner',
} as const;
