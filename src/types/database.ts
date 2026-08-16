export type UserPlan = 'community' | 'intensive';
export type UserStatus = 'active' | 'inactive' | 'cancelled';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  plan: UserPlan;
  status: UserStatus;
  role: UserRole;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          avatar_url?: string | null;
          plan?: UserPlan;
          status?: UserStatus;
          role?: UserRole;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
    };
  };
};
