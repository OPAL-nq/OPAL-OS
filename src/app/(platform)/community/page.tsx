import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CommunityRootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  const isAdmin = profile?.role === 'admin';

  let query = supabase
    .from('community_channels')
    .select('slug')
    .order('position', { ascending: true })
    .limit(1);

  if (!isAdmin) {
    query = query.eq('published', true);
  }

  const { data: channel } = await query.single();

  if (channel?.slug) {
    redirect(`/community/${channel.slug}`);
  }

  redirect('/community/annonces');
}
