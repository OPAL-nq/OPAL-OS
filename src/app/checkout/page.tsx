import React from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata = {
  title: 'Choisis ton accompagnement | OPAL OS Checkout',
  description:
    'Rejoignez OPAL OS et accédez à l\'écosystème de trading professionnel : Academy, Live Sessions, Systems, Community et Accompagnement Intensive.',
};

interface CheckoutPageProps {
  searchParams: Promise<{
    offer?: string;
    product?: string;
    status?: string;
    plan?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const rawOffer = (params.offer || params.plan || params.product || '').toLowerCase();

  const initialOffer: 'academy' | 'intensive' =
    rawOffer === 'intensive' || rawOffer === 'pro'
      ? 'intensive'
      : 'academy';

  return <CheckoutFlow initialOffer={initialOffer} />;
}
