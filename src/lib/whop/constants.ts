import { UserPlan } from '@/types';

/**
 * Official Whop Product IDs for OPAL OS (Used by Webhooks & Database sync)
 */
export const WHOP_PRODUCTS = {
  ACADEMY: 'prod_oVyKtV2XqBdJF',
  INTENSIVE: 'prod_rWw750hUkKQMm',
} as const;

/**
 * Official Whop Plan IDs / Checkout IDs for OPAL OS (Used by Embedded & Direct Checkout)
 * Can be overridden via environment variables if updated in Whop dashboard.
 */
export const WHOP_PLANS = {
  ACADEMY: process.env.NEXT_PUBLIC_WHOP_PLAN_ACADEMY || 'plan_oVyKtV2XqBdJF',
  INTENSIVE: process.env.NEXT_PUBLIC_WHOP_PLAN_INTENSIVE || 'plan_rWw750hUkKQMm',
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
 * Helper to resolve the OPAL plan corresponding to a Whop product or plan ID
 */
export function resolvePlanFromWhopProduct(id?: string | null): UserPlan {
  if (!id) return 'community';
  if (
    id === WHOP_PRODUCTS.INTENSIVE ||
    id === WHOP_PLANS.INTENSIVE ||
    id.toLowerCase().includes('intensive')
  ) {
    return 'intensive';
  }
  return 'community';
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
