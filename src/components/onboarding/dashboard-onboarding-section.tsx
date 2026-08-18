'use client';

import React, { useState } from 'react';
import { OnboardingChecklistWidget } from './onboarding-checklist-widget';
import { PlatformTourModal } from './platform-tour-modal';
import { Button } from '@/components/ui/button';
import { Compass, Sparkles } from 'lucide-react';

interface DashboardOnboardingSectionProps {
  hasCompletedAcademyLesson: boolean;
  hasConfiguredPropFirm: boolean;
  hasLoggedTrade: boolean;
  hasValidatedProtocol: boolean;
}

export function DashboardOnboardingSection({
  hasCompletedAcademyLesson,
  hasConfiguredPropFirm,
  hasLoggedTrade,
  hasValidatedProtocol,
}: DashboardOnboardingSectionProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <>
      <OnboardingChecklistWidget
        hasCompletedAcademyLesson={hasCompletedAcademyLesson}
        hasConfiguredPropFirm={hasConfiguredPropFirm}
        hasLoggedTrade={hasLoggedTrade}
        hasValidatedProtocol={hasValidatedProtocol}
        onOpenTour={() => setIsTourOpen(true)}
      />

      <PlatformTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </>
  );
}
