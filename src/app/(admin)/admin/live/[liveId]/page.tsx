import { redirect } from 'next/navigation';

export default async function AdminLiveRedirectPage({
  params,
}: {
  params: Promise<{ liveId: string }>;
}) {
  redirect('/admin/live');
}
