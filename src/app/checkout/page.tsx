import React from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';

export const metadata = {
  title: 'Rejoindre OPAL Intensive | Checkout Officiel',
  description:
    'Rejoignez le programme OPAL Intensive (1 998 €) : accompagnement individuel 1-on-1 avec Maxym, cockpit d’élite et accès complet au Trading OS des Futures (NQ/ES).',
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}

