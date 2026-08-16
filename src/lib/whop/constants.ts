import { UserPlan } from '@/types';

/**
 * Official Whop Product IDs for OPAL OS
 */
export const WHOP_PRODUCTS = {
  ACADEMY: 'prod_oVyKtV2XqBdJF',
  INTENSIVE: 'prod_rWw750hUkKQMm',
} as const;

export interface WhopProductMapping {
  id: string;
  name: string;
  plan: UserPlan;
  description: string;
}

export const WHOP_PRODUCT_MAP: Record<string, WhopProductMapping> = {
  [WHOP_PRODUCTS.ACADEMY]: {
    id: WHOP_PRODUCTS.ACADEMY,
    name: 'OPAL Academy',
    plan: 'community',
    description: 'Accès complet plateforme, Academy, Trading Workspace, Journal, Systems, Live Sessions & Community',
  },
  [WHOP_PRODUCTS.INTENSIVE]: {
    id: WHOP_PRODUCTS.INTENSIVE,
    name: 'OPAL Intensive',
    plan: 'intensive',
    description: 'Accès complet Academy & Community + Accompagnement individuel 1-on-1, Cockpit Intensive & Suivi',
  },
};

/**
 * Helper to resolve the OPAL plan corresponding to a Whop product ID
 */
export function resolvePlanFromWhopProduct(productId?: string | null): UserPlan {
  if (!productId) return 'community';
  const mapped = WHOP_PRODUCT_MAP[productId];
  return mapped ? mapped.plan : 'community';
}

/**
 * Helper to determine if a membership status confers active access
 */
export function isMembershipStatusActive(status?: string | null, valid?: boolean): boolean {
  if (valid === true) return true;
  if (!status) return false;
  const activeStatuses = ['active', 'valid', 'completed', 'trialing', 'past_due'];
  return activeStatuses.includes(status.toLowerCase());
}
