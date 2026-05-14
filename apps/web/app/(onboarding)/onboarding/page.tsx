"use client";

import OnboardingForm from "../components/OnboardingForm";
import { OnboardingWrapper } from "../../../components/auth-wrapper";

function OnboardingContent() {
  return <OnboardingForm />;
}

export default function OnboardingPage() {
  return (
    <OnboardingWrapper>
      <OnboardingContent />
    </OnboardingWrapper>
  );
}
