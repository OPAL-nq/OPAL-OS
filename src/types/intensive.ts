import type { Profile } from './index';

export type CoachingSessionType = 'private' | 'group';
export type CoachingSessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type IntensiveObjectiveStatus = 'active' | 'completed' | 'paused';

export interface CoachingSession {
  id: string;
  client_id: string;
  type: CoachingSessionType;
  scheduled_at: string;
  duration_minutes: number;
  status: CoachingSessionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Profile;
  report?: CoachingReport;
}

export interface CoachingReport {
  id: string;
  session_id: string;
  client_id: string;
  key_points: string | null;
  work_assigned: string | null;
  next_steps: string | null;
  created_at: string;
  session?: CoachingSession;
}

export interface IntensiveObjective {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: IntensiveObjectiveStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface IntensiveFollowUp {
  id: string;
  user_id: string;
  current_objective: string | null;
  points_worked: string | null;
  errors_to_fix: string | null;
  progression: string | null;
  next_step: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntensiveClientSummary {
  profile: Profile;
  nextSession: CoachingSession | null;
  lastFollowUp: IntensiveFollowUp | null;
  objectivesCount: {
    active: number;
    completed: number;
    paused: number;
  };
  lastReport: CoachingReport | null;
}
