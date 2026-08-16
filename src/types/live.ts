export type LiveType = 'live_trading' | 'masterclass' | 'collective';
export type LiveStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  type: LiveType;
  scheduled_at: string;
  stream_url: string | null;
  status: LiveStatus;
  published: boolean;
  created_at: string;
}

export interface LiveReplay {
  id: string;
  live_id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  published: boolean;
  created_at: string;
  live?: LiveSession;
}
