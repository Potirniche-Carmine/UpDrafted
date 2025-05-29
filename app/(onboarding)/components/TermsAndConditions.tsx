"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { OnboardingData } from "../onboarding/types";

interface TermsAndConditionsProps {
  agreeToTerms: boolean;
  ageConfirmation: boolean;
  role: string | null;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

export default function TermsAndConditions({ 
  agreeToTerms, 
  ageConfirmation, 
  role, 
  onInputChange 
}: TermsAndConditionsProps) {
  return (
    <div className="border-t pt-6 space-y-4">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => onInputChange('agreeToTerms', checked as boolean)}
          />
          <div className="text-sm">
            <label htmlFor="agreeToTerms" className="cursor-pointer">
              I agree to the{' '}
              <Link href="/terms-of-service" className="text-blue-600 hover:underline" target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank">
                Privacy Policy
              </Link>{' '}
              *
            </label>
          </div>
        </div>
        
        {role === 'athlete' && (
          <div className="flex items-start space-x-3">
            <Checkbox
              id="ageConfirmation"
              checked={ageConfirmation}
              onCheckedChange={(checked) => onInputChange('ageConfirmation', checked as boolean)}
            />
            <div className="text-sm">
              <label htmlFor="ageConfirmation" className="cursor-pointer">
                I confirm that I am at least 13 years old *
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 