"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingData, UserRole } from "../lib/types";
import CommonFields from "./CommonFields";
import AthleteForm from "./AthleteForm";
import CoachForm from "./CoachForm";
import RecruiterForm from "./RecruiterForm";
import TermsAndConditions from "./TermsAndConditions";
import { LoadingScreen } from "./LoadingScreen";

interface OnboardingFormProps {
  role: UserRole;
  onBack: () => void;
}

const initialData: OnboardingData = {
  role: null,
  fullName: "",
  profileImage: undefined,
  profileImagePreview: "",
  sport: "",
  secondarySports: [],
  graduationYear: null,
  educationLevel: "high_school",
  competitionLevel: "",
  organizationName: "",
  city: "",
  state: "",
  country: "United States",
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
  secondarySportsRecruiting: [],
  organizationLogo: undefined,
  organizationLogoPreview: "",
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
  sportSpecificNeeds: {},
  whatLookingFor: "",
  agreeToTerms: false,
  ageConfirmation: false
};

export default function OnboardingForm({ role, onBack }: OnboardingFormProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({ ...initialData, role });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleInputChange = (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean | { [sport: string]: { graduationYears: number[]; positions: string[]; scholarshipsAvailable: number | null; recruitingPhilosophy: string; } }) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
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

      // Create FormData to handle file upload and other data
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('email', user.emailAddresses[0].emailAddress);
      formData.append('role', data.role);
      formData.append('profileData', JSON.stringify(profileData));
      
      // Add profile image if provided
      if (data.profileImage instanceof File) {
        formData.append('profileImage', data.profileImage);
      }
      
      // Add organization logo if provided (for coach/recruiter)
      if (data.organizationLogo instanceof File && (data.role === 'coach' || data.role === 'recruiter')) {
        formData.append('organizationLogo', data.organizationLogo);
      }

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        // Force reload the user to get updated metadata
        await user.reload();
        
        // Give the system time to propagate the role changes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Keep user on loading screen - LoadingScreen will handle the redirect
        // Don't call navigateToProfile here to avoid multiple redirects
      } else {
        const errorData = await response.json();
        if (errorData.validationErrors) {
          const errorList = Object.entries(errorData.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
          throw new Error(`${errorData.error}\n${errorList}`);
        }
        throw new Error(errorData.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
      alert(`Something went wrong: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setIsLoading(false);
    }
    // Note: Don't set setIsLoading(false) on success - let LoadingScreen handle the full flow
  };

  const canSubmit = () => {
    if (!data.role || !data.fullName || !data.agreeToTerms) return false;
    
    // Only require age confirmation for athletes
    if (data.role === 'athlete' && !data.ageConfirmation) return false;
    
    if (data.role === 'athlete') {
      const baseRequirements = !!(
        data.sport && 
        data.graduationYear && 
        data.educationLevel &&
        data.organizationName && 
        data.city && 
        (data.country === 'United States' ? data.state : true) &&
        data.country &&
        data.heightFeet && 
        data.heightInches &&
        data.weight && 
        data.positions.length > 0 &&
        data.intendedMajor &&
        data.personalStatement
      );

      // Competition level is required for undergraduate and graduate students
      const competitionLevelRequirement = (data.educationLevel === 'undergraduate' || data.educationLevel === 'graduate') 
        ? !!data.competitionLevel 
        : true;

      // Academic requirements depend on education level
      let academicRequirements = false;
      if (data.educationLevel === 'high_school') {
        // High school students need at least one: GPA, SAT, or ACT
        academicRequirements = !!(data.gpa || data.satScore || data.actScore);
      } else {
        // College students just need to have completed the form (GPA is recommended but not required)
        academicRequirements = true;
      }

      return baseRequirements && competitionLevelRequirement && academicRequirements;
    } else if (data.role === 'coach') {
      // Base requirements for coaches
      const baseRequirements = !!(
        data.title && 
        data.organizationName && 
        data.sportCoaching && 
        data.division && 
        data.city && 
        (data.country === 'United States' ? data.state : true) &&
        (data.orgInstagramHandle || data.orgTwitterHandle || data.programWebsite || data.schoolWebsite) &&
        data.personalStatement
      );

      // Only require recruiting needs for non-high school coaches
      const recruitingRequirements = data.division === 'High School' || !!(
        data.recruitingGraduationYears.length > 0 &&
        data.recruitingPositions.length > 0 &&
        data.recruitingPhilosophy
      );

      return baseRequirements && recruitingRequirements;
    } else {
      // Requirements for recruiters
      const baseRequirements = !!(
        data.title && 
        data.organizationName && 
        data.sportCoaching && 
        data.division && 
        data.city && 
        (data.country === 'United States' ? data.state : true) &&
        (data.orgInstagramHandle || data.orgTwitterHandle || data.programWebsite || data.schoolWebsite) &&
        data.personalStatement
      );

      // For high school recruiters, don't require recruiting needs
      if (data.division === 'High School') {
        return baseRequirements;
      }

      // Only require recruiting needs for the main sport during onboarding
      // Secondary sports and their needs can be added later on the profile
      const mainSportNeeds = data.sportSpecificNeeds[data.sportCoaching];
      const mainSportRequirements = mainSportNeeds && 
             mainSportNeeds.graduationYears.length > 0 && 
             mainSportNeeds.positions.length > 0 && 
             mainSportNeeds.recruitingPhilosophy.trim().length > 0;

      return baseRequirements && mainSportRequirements;
    }
  };

  // Show loading screen when submitting
  if (isLoading) {
    return <LoadingScreen role={role} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Complete Your {data.role === 'athlete' ? 'Athletic' : data.role === 'coach' ? 'Coaching' : 'Recruiting'} Profile
          </h1>
          <p className="text-muted-foreground">
            {data.role === 'recruiter' 
              ? "Tell us about yourself and the sports you recruit for to get the most out of UpDrafted. You can recruit for multiple sports and set specific needs for each. You can add highlights and videos later!"
              : "Tell us about yourself to get the most out of UpDrafted. You can add highlights and videos later!"
            }
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
            ) : data.role === 'coach' ? (
              <CoachForm 
                data={data} 
                onInputChange={(field, value) => handleInputChange(field as keyof OnboardingData, value)}
              />
            ) : (
              <RecruiterForm 
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
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 