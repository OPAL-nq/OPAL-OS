import { Profile, UserPlan, UserRole } from './database';

export interface DirectMessageAuthor {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  plan: UserPlan;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: DirectMessageAuthor;
  receiver?: DirectMessageAuthor;
}

export interface ConversationSummary {
  userId: string;
  profile: Profile;
  lastMessage: DirectMessage;
  unreadCount: number;
}
