"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSecureHeaders } from "@/utils/clerk-security";
import { OnboardingData, UserRole } from "../components/types";
import CommonFields from "./CommonFields";
import AthleteForm from "./AthleteForm";
import CoachRecruiterForm from "./CoachRecruiterForm";
import TermsAndConditions from "./TermsAndConditions";

interface OnboardingFormProps {
  role: UserRole;
  onBack: () => void;
}

const initialData: OnboardingData = {
  role: null,
  fullName: "",
  sport: "",
  secondarySports: [],
  graduationYear: null,
  highSchool: "",
  city: "",
  state: "",
  heightFeet: "",
  heightInches: "",
  weight: "",
  positions: [],
  gpa: null,
  satScore: null,
  actScore: null,
  intendedMajor: "",
  gender: "",
  maxprepsUrl: "",
  hudlUrl: "",
  instagramHandle: "",
  twitterHandle: "",
  personalStatement: "",
  title: "",
  sportCoaching: "",
  organizationName: "",
  division: "",
  conference: "",
  programWebsite: "",
  schoolWebsite: "",
  orgInstagramHandle: "",
  orgTwitterHandle: "",
  recruitingPhilosophy: "",
  recruitingGraduationYears: [],
  recruitingPositions: [],
  scholarshipsAvailable: null,
  whatLookingFor: "",
  agreeToTerms: false,
  ageConfirmation: false
};

export default function OnboardingForm({ role, onBack }: OnboardingFormProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({ ...initialData, role });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleInputChange = (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => {
    setData({ ...data, [field]: value });
  };

  const handleSubmit = async () => {
    if (!user || !data.role) return;
    
    setIsLoading(true);
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Convert height to combined format
      const height = data.role === 'athlete' && data.heightFeet && data.heightInches 
        ? `${data.heightFeet}'${data.heightInches}"`
        : '';

      const profileData = {
        ...data,
        height // Add combined height for athletes
      };

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: createSecureHeaders(token),
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          role: data.role,
          profileData
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
      alert(`Something went wrong: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = () => {
    if (!data.role || !data.fullName || !data.agreeToTerms) return false;
    
    // Only require age confirmation for athletes
    if (data.role === 'athlete' && !data.ageConfirmation) return false;
    
    if (data.role === 'athlete') {
      return !!(
        data.sport && 
        data.graduationYear && 
        data.highSchool && 
        data.city && 
        data.state && 
        data.heightFeet && 
        data.heightInches &&
        data.weight && 
        data.positions.length > 0 &&
        (data.gpa || data.satScore || data.actScore) &&
        data.intendedMajor &&
        data.personalStatement
      );
    } else {
      return !!(
        data.title && 
        data.organizationName && 
        data.sportCoaching && 
        data.division && 
        data.city && 
        data.state &&
        (data.orgInstagramHandle || data.orgTwitterHandle || data.programWebsite || data.schoolWebsite) &&
        data.recruitingPhilosophy &&
        data.recruitingGraduationYears.length > 0 &&
        data.recruitingPositions.length > 0 &&
        data.whatLookingFor
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Complete Your {data.role === 'athlete' ? 'Athletic' : data.role === 'coach' ? 'Coaching' : 'Recruiting'} Profile
          </h1>
          <p className="text-muted-foreground">
            Tell us about yourself to get the most out of UpDrafted. You can add highlights and videos later!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <CommonFields
              fullName={data.fullName}
              profileImagePreview={data.profileImagePreview}
              onInputChange={handleInputChange}
            />
            {data.role === 'athlete' ? (
              <AthleteForm 
                data={data} 
                onInputChange={(field, value) => handleInputChange(field as keyof OnboardingData, value)} 
              />
            ) : (
              <CoachRecruiterForm 
                data={data} 
                onInputChange={(field, value) => handleInputChange(field as keyof OnboardingData, value)}
              />
            )}

            <TermsAndConditions
              agreeToTerms={data.agreeToTerms}
              ageConfirmation={data.ageConfirmation}
              role={data.role}
              onInputChange={(field, value) => handleInputChange(field as keyof OnboardingData, value)}
            />

            <div className="flex gap-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="h-11"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || isLoading}
                className="flex-1 h-11"
              >
                {isLoading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 