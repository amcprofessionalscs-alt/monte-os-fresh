import { supabase } from './supabase';

export interface CustomerRecord {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  has_paid: boolean;
  product_type: 'audit' | 'lite' | 'pro' | 'partner' | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateCustomer(userId: string): Promise<CustomerRecord | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer:', error);
    return null;
  }

  if (data) return data;

  // Create new customer record if doesn't exist
  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert([{ user_id: userId, has_paid: false, product_type: null }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating customer:', createError);
    return null;
  }

  return newCustomer;
}

export async function checkCustomerPaymentStatus(userId: string): Promise<{
  hasPaid: boolean;
  productType: 'audit' | 'lite' | 'pro' | 'partner' | null;
  paymentDate: string | null;
}> {
  const customer = await getOrCreateCustomer(userId);

  return {
    hasPaid: customer?.has_paid ?? false,
    productType: customer?.product_type ?? null,
    paymentDate: customer?.payment_date ?? null,
  };
}

export async function updateCustomerPaymentStatus(
  userId: string,
  productType: 'audit' | 'lite' | 'pro' | 'partner',
  stripeCustomerId?: string
): Promise<void> {
  const customer = await getOrCreateCustomer(userId);

  if (!customer) throw new Error('Failed to get or create customer');

  const { error } = await supabase
    .from('customers')
    .update({
      has_paid: true,
      product_type: productType,
      payment_date: new Date().toISOString(),
      stripe_customer_id: stripeCustomerId || customer.stripe_customer_id,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating customer payment status:', error);
    throw error;
  }
}
