"use client";

import { useState, useEffect } from "react";
import { UserRole } from "../lib/types";
import RoleSelection from "../components/RoleSelection";
import OnboardingForm from "../components/OnboardingForm";
import { OnboardingWrapper } from "../../../components/auth-wrapper";

function OnboardingContent() {
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("details");
    // Scroll to top when moving to details form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRole(null);
    // Scroll to top of "Welcome to UpDrafted" when going back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === "role") {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  if (selectedRole) {
    return <OnboardingForm role={selectedRole} onBack={handleBack} />;
  }

  return null;
}

export default function OnboardingPage() {
  return (
    <OnboardingWrapper>
      <OnboardingContent />
    </OnboardingWrapper>
  );
}