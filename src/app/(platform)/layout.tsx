import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import type { Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* Sidebar navigation */}
      <Sidebar profile={profile} />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  );
}
