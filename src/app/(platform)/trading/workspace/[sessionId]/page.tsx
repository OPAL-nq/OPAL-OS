import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { WorkspaceForm } from '@/components/trading/workspace-form';
import { WorkspaceSession } from '@/types/trading';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function EditWorkspaceSessionPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessionData } = await supabase
    .from('workspace_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user?.id || '')
    .single();

  if (!sessionData) {
    notFound();
  }

  const session = sessionData as WorkspaceSession;

  return (
    <div className="space-y-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white">
          Session du {session.session_date} — {session.instrument}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Modifiez ou revoyez votre plan de trading pour cette session.
        </p>
      </div>

      <WorkspaceForm initialData={session} />
    </div>
  );
}
