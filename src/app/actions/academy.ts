'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleLessonProgress(lessonId: string, completed: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  if (completed) {
    // Upsert completed progress
    const { error } = await supabase.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (error) {
      console.error('Error marking lesson complete:', error);
      throw new Error(error.message);
    }
  } else {
    // Remove or set false
    const { error } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Error unmarking lesson:', error);
      throw new Error(error.message);
    }
  }

  revalidatePath('/academy');
  revalidatePath('/dashboard');
  return { success: true };
}
