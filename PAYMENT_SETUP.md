# Payment & Access Control Setup Guide

This guide walks you through setting up payment protection for your Next Step OS dashboard.

## What Changed

✅ Dashboard now requires payment to access  
✅ Unauthenticated users redirected to pricing page  
✅ Authenticated but unpaid users redirected to pricing page  
✅ New pricing page with Next Step Audit ($997) and Execution Workshop ($297)  
✅ Stripe integration for secure payments  
✅ Payment verification with Stripe webhooks  

## Step 1: Supabase Setup

### Create Customers Table

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the SQL from `supabase/migrations/001_create_customers_table.sql`
6. Click **Run**

This creates a `customers` table that tracks:
- User authentication
- Payment status (paid/unpaid)
- Product type (audit/workshop)
- Payment date
- Stripe customer ID

## Step 2: Stripe Setup

### Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://stripe.com)
2. Click **Developers** → **API keys**
3. Copy your **Publishable Key** (pk_...)
4. Copy your **Secret Key** (sk_...)
5. Scroll down to **Webhooks** section
6. Click **Add endpoint**

### Create Your Products (If Not Already Done)

1. In Stripe Dashboard, go to **Products**
2. Create two products:
   - **Next Step Audit** — $997 (one-time payment)
   - **Execution Workshop** — $297 (one-time payment)
3. Copy the **Price ID** for each (format: `price_xxx...`)

### Set Up Webhook Endpoint

1. In **Webhooks**, click **Add endpoint**
2. Enter your URL: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Click **Add endpoint**
5. Copy the **Signing Secret** (starts with `whsec_`)

## Step 3: Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Public Key visible in browser)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Stripe (Secret Key — NEVER expose)
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe Product IDs from your dashboard
NEXT_PUBLIC_STRIPE_AUDIT_PRICE_ID=price_1Gx...
NEXT_PUBLIC_STRIPE_WORKSHOP_PRICE_ID=price_1Gy...

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Calendly Booking URL
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/yourname/audit

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 4: Testing

### Test With Stripe Test Keys

Use Stripe's test credentials:

**Test Card Numbers:**
- Successful payment: `4242 4242 4242 4242`
- Card requires authentication: `4000 0025 0000 3155`
- Card declined: `4000 0000 0000 0002`

Use any future expiry date and any CVC.

### Test Workflow

1. Go to `/pricing`
2. Sign in with a test account
3. Click "Unlock Now" on either product
4. Use test card `4242 4242 4242 4242`
5. After payment, you should:
   - See success page with confirmation
   - Be redirected to dashboard
   - See payment status saved in Supabase `customers` table

## Step 5: Deployment

### Production Setup

1. Update `.env.local` with **production** Stripe keys (pk_live_... and sk_live_...)
2. Change `NEXT_PUBLIC_CALENDLY_URL` to your Calendly booking link
3. Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Set up webhook endpoint on production domain

### Important Security Notes

⚠️ **Never commit `.env.local` to git**  
⚠️ **Secret keys should only be in environment variables**  
⚠️ **Enable HTTPS on production**  
⚠️ **Verify webhook signatures** (already implemented)  

## Key Files

- **Pricing Page**: `app/pricing/page.tsx`
- **Payment Success**: `app/payment-success/page.tsx`
- **Stripe Checkout**: `app/api/stripe/checkout/route.ts`
- **Stripe Webhook**: `app/api/stripe/webhook/route.ts`
- **Payment Utilities**: `lib/payments.ts`
- **Dashboard (Protected)**: `app/page.tsx` (now requires payment)

## Features Implemented

✅ **Payment Wall**: Dashboard behind payment verification  
✅ **Stripe Integration**: Secure payment processing  
✅ **Webhook Handling**: Automatic payment confirmation  
✅ **Product Selection**: Users choose between two offerings  
✅ **Calendly Integration**: Book audit calls directly from pricing  
✅ **Error Handling**: Graceful failure states and redirects  
✅ **User Tracking**: Payment history in Supabase  

## Troubleshooting

### Users stuck on pricing page after payment
- Check Supabase `customers` table to see if `has_paid` was updated
- Verify webhook is delivering events (Stripe Dashboard → Webhooks)
- Check server logs for errors

### Stripe webhook not working
- Verify endpoint URL is accessible and public
- Check webhook signing secret in `.env.local`
- Test webhook delivery from Stripe dashboard

### Payment success page shows "Payment Issue"
- Check browser console for errors
- Verify session ID is passed in URL
- Ensure Supabase credentials are correct

## Next Steps

1. ✅ Complete steps 1-5 above
2. Test payment flow with test cards
3. Switch to production Stripe keys
4. Update your landing/marketing pages to direct users to `/pricing`
5. Monitor payments in Stripe Dashboard

---

**Support**: For issues, check server logs and Stripe Dashboard event history.
