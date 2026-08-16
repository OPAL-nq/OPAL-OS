import { UserPlan } from './index';

export interface WhopProductConfig {
  id: string;
  name: string;
  plan: UserPlan;
  description: string;
}

export interface WhopMembership {
  id: string;
  user_id: string | null;
  email: string;
  whop_user_id: string | null;
  whop_membership_id: string;
  whop_product_id: string;
  whop_plan_id: string | null;
  status: string;
  plan_type: UserPlan;
  starts_at: string | null;
  expires_at: string | null;
  last_event: string | null;
  raw_data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface WhopWebhookEvent {
  action: string;
  data: {
    id: string; // membership id
    user_id?: string;
    product_id?: string;
    plan_id?: string;
    email?: string;
    user?: {
      id?: string;
      email?: string;
      username?: string;
    };
    status?: string;
    valid?: boolean;
    created_at?: number | string;
    expires_at?: number | string | null;
    renewal_period_start?: number | string | null;
    renewal_period_end?: number | string | null;
    [key: string]: any;
  };
  type?: string;
  [key: string]: any;
}
