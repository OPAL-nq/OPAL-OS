'use client';

import React, { useEffect } from 'react';
import { LandingNav } from './landing-nav';
import { HeroSection } from './hero-section';
import { ProblemSolutionSection } from './problem-solution-section';
import { MentorshipPillarsSection } from './mentorship-pillars-section';
import { CockpitPreviewSection } from './cockpit-preview-section';
import { CurriculumRoadmapSection } from './curriculum-roadmap-section';
import { PricingSection } from './pricing-section';
import { FaqSection } from './faq-section';
import { StickyCtaBar } from './sticky-cta-bar';
import { LandingFooter } from './landing-footer';
import { trackPixelEvent } from '@/components/tracking/pixel-tracker';

export function MentorshipLandingPage() {
  useEffect(() => {
    // Fire ViewContent event on landing page view
    trackPixelEvent('ViewContent', {
      content_name: 'OPAL Intensive Mentorship Landing Page',
      content_category: 'Mentorship',
      value: 1998,
      currency: 'EUR',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#39FF14] selection:text-black">
      {/* Sticky Top Header Navigation */}
      <LandingNav />

      {/* Main Sections Stack */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Problem vs Solution / Why retail traders fail */}
        <ProblemSolutionSection />

        {/* 3. The 2 Major Pillars (Mentoring 1-on-1 + OPAL OS Platform) */}
        <MentorshipPillarsSection />

        {/* 4. Interactive Cockpit & OS Preview */}
        <CockpitPreviewSection />

        {/* 5. 4-Step Methodology & Roadmap */}
        <CurriculumRoadmapSection />

        {/* 6. Pricing & Value Stack (€1,998) */}
        <PricingSection />

        {/* 7. Interactive CRO FAQ */}
        <FaqSection />
      </main>

      {/* Sticky Conversion Bar (triggers on scroll) */}
      <StickyCtaBar />

      {/* Professional Footer */}
      <LandingFooter />
    </div>
  );
}
