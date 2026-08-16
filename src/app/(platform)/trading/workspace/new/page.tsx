import React from 'react';
import { WorkspaceForm } from '@/components/trading/workspace-form';

export const dynamic = 'force-dynamic';

export default function NewWorkspaceSessionPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white">Préparation de Session</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Formalisez votre cadre d'intervention avant l'ouverture des marchés.
        </p>
      </div>

      <WorkspaceForm />
    </div>
  );
}
