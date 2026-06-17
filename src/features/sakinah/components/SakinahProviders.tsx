/**
 * SakinahProviders
 * Wraps all Sakinah routes with the OnboardingProvider context so that
 * any page in the /matrimony/* tree can call useOnboarding() safely.
 * Renders children directly — no extra DOM shell — so each page controls
 * its own full-screen layout.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { OnboardingProvider } from '../context/OnboardingContext';

export const SakinahProviders: React.FC = () => (
  <OnboardingProvider>
    <Outlet />
  </OnboardingProvider>
);
