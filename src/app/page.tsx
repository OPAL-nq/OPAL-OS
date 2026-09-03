import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MentorshipLandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'OPAL Intensive | Mentorat Privé 1-on-1 & Trading OS des Futures (NQ/ES)',
  description:
    'Rejoignez le programme de mentorat OPAL Intensive avec Maxym (1 998 €) : 2 sessions privées par semaine, audit continu de vos trades et accès intégral au logiciel de trading OPAL OS.',
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <MentorshipLandingPage />;
}
