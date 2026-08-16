export interface Module {
  id: string;
  title: string;
  description: string | null;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  video_provider: string;
  duration: string | null;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  url: string;
  type: string;
  position: number;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface ModuleWithLessons extends Module {
  lessons: (Lesson & { isCompleted?: boolean })[];
  totalLessons?: number;
  completedLessons?: number;
  progressPercent?: number;
}
