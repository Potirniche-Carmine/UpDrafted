"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
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
  organizationName: "",
  city: "",
  state: "",
  country: "United States",
  heightFeet: "",
  heightInches: "",
  weight: "",
  positions: [],
  teamLevel: undefined,
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
  recruitingStudentClassifications: [],
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
  const router = useRouter();
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
      formData.append('email', user.email || '');
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
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        // Force a hard refresh to reload Better Auth cookies and session
        // This ensures the new role is immediately recognized without re-login
        window.location.href = "/dashboard";
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
      const isCollege = data.educationLevel === 'undergraduate' || data.educationLevel === 'graduate';
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
        data.personalStatement &&
        (isCollege ? data.division : data.teamLevel)
      );

      // Conference is required for undergraduate and graduate students
      const conferenceRequirement = isCollege
        ? !!data.conference
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

      return baseRequirements && conferenceRequirement && academicRequirements;
    } else if (data.role === 'coach') {
      // Base requirements for coaches
      const baseRequirements = !!(
        data.title &&
        data.organizationName &&
        data.sportCoaching &&
        data.division &&
        data.city &&
        (data.country === 'United States' ? data.state : true) &&
        (data.programWebsite || data.schoolWebsite) &&
        data.personalStatement
      );

      // Conference is required for all coaches (unless High School)
      const conferenceRequirement = data.division === 'High School' ? true : !!data.conference;

      // Only require recruiting needs for non-high school coaches
      const recruitingRequirements = data.division === 'High School' || !!(
        data.recruitingStudentClassifications.length > 0 &&
        data.recruitingPositions.length > 0 &&
        data.recruitingPhilosophy
      );

      return baseRequirements && conferenceRequirement && recruitingRequirements;
    } else {
      // Requirements for recruiters
      const baseRequirements = !!(
        data.title &&
        data.organizationName &&
        data.sportCoaching &&
        data.division &&
        data.city &&
        (data.country === 'United States' ? data.state : true) &&
        (data.programWebsite || data.schoolWebsite) &&
        data.personalStatement
      );

      // Conference is required for all recruiters (unless High School)
      const conferenceRequirement = data.division === 'High School' ? true : !!data.conference;

      // For high school recruiters, don't require recruiting needs
      if (data.division === 'High School') {
        return baseRequirements && conferenceRequirement;
      }

      // Only require recruiting needs for the main sport during onboarding
      // Secondary sports and their needs can be added later on the profile
      const mainSportNeeds = data.sportSpecificNeeds[data.sportCoaching];
      const mainSportRequirements = mainSportNeeds &&
        mainSportNeeds.studentClassifications.length > 0 &&
        mainSportNeeds.positions.length > 0 &&
        mainSportNeeds.recruitingPhilosophy.trim().length > 0;

      return baseRequirements && conferenceRequirement && mainSportRequirements;
    }
  };

  const getMissingFields = (): string[] => {
    const missing: string[] = [];

    if (!data.fullName) missing.push("Full name");
    if (!data.agreeToTerms) missing.push("Agreement to Terms of Service and Privacy Policy");

    if (data.role === 'athlete') {
      if (!data.ageConfirmation) missing.push("Age confirmation (13 years or older)");
      if (!data.sport) missing.push("Primary sport");
      if (data.educationLevel === 'high_school' && !data.teamLevel) missing.push("Team level");
      if (!data.graduationYear) missing.push("Graduation year");
      if (!data.educationLevel) missing.push("Education level");
      if (!data.organizationName) missing.push("School/organization name");
      if (!data.city) missing.push("City");
      if (!data.country) missing.push("Country");
      if (data.country === 'United States' && !data.state) missing.push("State");
      if (!data.heightFeet) missing.push("Height (feet)");
      if (!data.heightInches) missing.push("Height (inches)");
      if (!data.weight) missing.push("Weight");
      if (!data.positions.length) missing.push("At least one position");
      if (!data.intendedMajor) missing.push("Intended/current major");
      if (!data.personalStatement) missing.push("Personal statement");

      // Division for college students
      if ((data.educationLevel === 'undergraduate' || data.educationLevel === 'graduate') && !data.division) {
        missing.push("Division");
      }

      // Academic requirements for high school
      if (data.educationLevel === 'high_school' && !data.gpa && !data.satScore && !data.actScore) {
        missing.push("At least one academic score (GPA, SAT, or ACT)");
      }
    } else if (data.role === 'coach') {
      if (!data.title) missing.push("Title/position");
      if (!data.organizationName) missing.push("Organization name");
      if (!data.sportCoaching) missing.push("Primary sport");
      if (!data.division) missing.push("Division");
      if (!data.city) missing.push("City");
      if (data.country === 'United States' && !data.state) missing.push("State");
      if (!data.programWebsite && !data.schoolWebsite) {
        missing.push("At least one website link (Program Website or School Website)");
      }
      if (!data.personalStatement) missing.push("Personal statement");

      // Recruiting requirements for non-high school
      if (data.division !== 'High School') {
        if (!data.recruitingStudentClassifications.length) missing.push("Student classifications you recruit");
        if (!data.recruitingPositions.length) missing.push("Positions you recruit");
        if (!data.recruitingPhilosophy) missing.push("Recruiting philosophy");
      }
    } else if (data.role === 'recruiter') {
      if (!data.title) missing.push("Title/position");
      if (!data.organizationName) missing.push("Organization name");
      if (!data.sportCoaching) missing.push("Primary sport");
      if (!data.division) missing.push("Division");
      if (!data.city) missing.push("City");
      if (data.country === 'United States' && !data.state) missing.push("State");
      if (!data.programWebsite && !data.schoolWebsite) {
        missing.push("At least one website link (Program Website or School Website)");
      }
      if (!data.personalStatement) missing.push("Personal statement");

      // Recruiting requirements for non-high school
      if (data.division !== 'High School') {
        const mainSportNeeds = data.sportSpecificNeeds[data.sportCoaching];
        if (!mainSportNeeds || !mainSportNeeds.studentClassifications.length) {
          missing.push("Student classifications for your primary sport");
        }
        if (!mainSportNeeds || !mainSportNeeds.positions.length) {
          missing.push("Positions for your primary sport");
        }
        if (!mainSportNeeds || !mainSportNeeds.recruitingPhilosophy.trim()) {
          missing.push("Recruiting philosophy for your primary sport");
        }
      }
    }

    return missing;
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

            {/* Show missing fields if form cannot be submitted */}
            {!canSubmit() && (
              <div className="p-6 border border-border bg-card rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Complete Required Fields
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Please fill out the following fields to create your profile:
                    </p>
                    <div className="space-y-2">
                      {getMissingFields().map((field, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                          <span className="text-foreground">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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