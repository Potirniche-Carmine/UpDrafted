"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Plus,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { useAuth, useUser } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, SocialInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConferenceSelector } from "@/components/ui/conference-selector";
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload";
import { SchoolSelector } from "@/components/ui/school-selector";
import { UnifiedSportSelector } from "@/components/ui/unified-sport-selector";
import {
  DIVISIONS,
  FEATURED_ONBOARDING_SPORTS,
  SPORT_GENDER_LABELS,
  US_STATES,
  formatSportName,
  getGraduationYearsForEducationLevel,
  getPositionsForSport,
  getSportCategory,
  type SportGenderCategory,
} from "@/lib/sports-data";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "./LoadingScreen";
import TermsAndConditions from "./TermsAndConditions";
import {
  EducationLevel,
  InstitutionHistoryEntry,
  InstitutionType,
  OnboardingFormData,
  SportPositions,
  UserRole,
} from "../lib/onboarding";

type FieldValue =
  | string
  | number
  | string[]
  | number[]
  | File
  | null
  | boolean
  | InstitutionHistoryEntry[]
  | SportPositions
  | OnboardingFormData["sportSpecificNeeds"];

interface OnboardingFormProps {
  role?: UserRole;
  onBack?: () => void;
}

const profileTypes: Array<{
  role: UserRole;
  title: string;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    role: "athlete",
    title: "Student-Athlete",
    description: "Build a profile around your sport, school history, film links, and recruiting-ready details.",
    icon: UserRound,
  },
  {
    role: "coach",
    title: "Coach",
    description: "Represent your program, publish current roster needs, and connect with athletes.",
    icon: Trophy,
  },
  {
    role: "recruiter",
    title: "Recruiter / Athletics Staff",
    description: "Create a recruiting profile for one or more sports with institution-level visibility.",
    icon: BriefcaseBusiness,
  },
];

const institutionTypes: Array<{ value: InstitutionType; label: string }> = [
  { value: "high_school", label: "High School" },
  { value: "juco", label: "JUCO" },
  { value: "club", label: "Club" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "other", label: "Other" },
];

const educationOptions: Array<{ value: EducationLevel; label: string }> = [
  { value: "high_school", label: "High School" },
  { value: "associate", label: "JUCO / Associate" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
];

const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Spain", "Italy", "Brazil", "Mexico"];
const monthYearPattern = /^(0[1-9]|1[0-2])\/\d{4}$/;

const initialData: OnboardingFormData = {
  role: null,
  fullName: "",
  profileImage: undefined,
  profileImagePreview: "",
  sport: "",
  secondarySports: [],
  sportPositions: {},
  graduationYear: null,
  educationLevel: "high_school",
  institutionType: "high_school",
  institutionHistory: [],
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
  ageConfirmation: false,
};

function roleLabel(role: UserRole | null) {
  if (role === "coach") return "coach";
  if (role === "recruiter") return "recruiter";
  return "athlete";
}

function schoolClassificationLabel(type: InstitutionType) {
  return institutionTypes.find((option) => option.value === type)?.label ?? "Institution";
}

function getSteps(role: UserRole | null) {
  return role === "athlete"
    ? ["Profile Type", "Basic Details", "Sport & Position", "Education", "Profile"]
    : ["Profile Type", "Basic Details", "Sport & Needs", "Institution", "Profile"];
}

function institutionTypeForEducation(level: EducationLevel): InstitutionType {
  if (level === "associate") return "juco";
  if (level === "undergraduate") return "undergraduate";
  if (level === "graduate") return "graduate";
  return "high_school";
}

function isSportAllowedForGender(sport: string, gender: string) {
  if (!sport || (gender !== "male" && gender !== "female")) return true;
  const category = getSportCategory(sport);
  return gender === "male" ? category === "mens" : category === "females";
}

function formatMonthYearInput(value: string) {
  const digits = value.replace(/[^\d]/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function OnboardingForm({ role: presetRole, onBack }: OnboardingFormProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(presetRole ? 1 : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [draftHistory, setDraftHistory] = useState<InstitutionHistoryEntry>({
    id: "",
    name: "",
    type: "high_school",
    startYear: "",
    endYear: "",
  });
  const [data, setData] = useState<OnboardingFormData>({ ...initialData, role: presetRole ?? null });

  const steps = getSteps(data.role);
  const isAthlete = data.role === "athlete";
  const isCoachOrRecruiter = data.role === "coach" || data.role === "recruiter";
  const selectedSports = isAthlete
    ? [data.sport, ...data.secondarySports].filter(Boolean)
    : [data.sportCoaching, ...data.secondarySportsRecruiting].filter(Boolean);
  const currentRole = roleLabel(data.role);
  const selectedSportGender: SportGenderCategory | null =
    data.gender === "male" || data.gender === "female" ? data.gender : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const primaryPositions = useMemo(() => {
    const sport = isAthlete ? data.sport : data.sportCoaching;
    return sport ? getPositionsForSport(sport) : [];
  }, [data.sport, data.sportCoaching, isAthlete]);

  const update = (field: keyof OnboardingFormData, value: FieldValue) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (blob: Blob, croppedImageUrl: string) => {
    update("profileImage", new File([blob], "profile-picture.jpg", { type: "image/jpeg" }));
    update("profileImagePreview", croppedImageUrl);
  };

  const toggleSportPosition = (sport: string, position: string) => {
    const current = data.sportPositions[sport] ?? [];
    const next = current.includes(position)
      ? current.filter((item) => item !== position)
      : [...current, position];
    const sportPositions = { ...data.sportPositions, [sport]: next };
    update("sportPositions", sportPositions);
    if (sport === data.sport) {
      update("positions", next);
    }
  };

  const toggleRecruitingPosition = (position: string) => {
    const next = data.recruitingPositions.includes(position)
      ? data.recruitingPositions.filter((item) => item !== position)
      : [...data.recruitingPositions, position];
    update("recruitingPositions", next);
    syncRecruiterNeeds(selectedSports, next);
  };

  const syncRecruiterNeeds = (sports: string[], positions = data.recruitingPositions, scholarships = data.scholarshipsAvailable) => {
    const needs: OnboardingFormData["sportSpecificNeeds"] = {};
    sports.forEach((sport) => {
      needs[sport] = {
        studentClassifications: [],
        positions,
        scholarshipsAvailable: scholarships,
        recruitingPhilosophy: "",
      };
    });
    update("sportSpecificNeeds", needs);
  };

  const updateGender = (gender: SportGenderCategory) => {
    const nextSport = isSportAllowedForGender(data.sport, gender) ? data.sport : "";
    const nextSecondarySports = data.secondarySports.filter((sport) => isSportAllowedForGender(sport, gender));
    const nextSportPositions: SportPositions = {};

    [nextSport, ...nextSecondarySports].filter(Boolean).forEach((sport) => {
      nextSportPositions[sport] = data.sportPositions[sport] ?? [];
    });

    update("gender", gender);
    update("sport", nextSport);
    update("secondarySports", nextSecondarySports);
    update("sportPositions", nextSportPositions);
    update("positions", nextSport ? nextSportPositions[nextSport] ?? [] : []);
  };

  const updatePrimarySport = (sport: string) => {
    if (isAthlete) {
      update("sport", sport);
      update("positions", []);
      update("sportPositions", { ...data.sportPositions, [sport]: [] });
      return;
    }

    const sports = [sport, ...data.secondarySportsRecruiting].filter(Boolean);
    update("sportCoaching", sport);
    syncRecruiterNeeds(sports);
  };

  const updateSecondarySports = (sports: string[]) => {
    if (isAthlete) {
      const sportPositions = { ...data.sportPositions };
      sports.forEach((sport) => {
        sportPositions[sport] = sportPositions[sport] ?? [];
      });
      Object.keys(sportPositions).forEach((sport) => {
        if (sport !== data.sport && !sports.includes(sport)) {
          delete sportPositions[sport];
        }
      });
      update("secondarySports", sports);
      update("sportPositions", sportPositions);
      return;
    }

    const allSports = [data.sportCoaching, ...sports].filter(Boolean);
    update("secondarySportsRecruiting", sports);
    syncRecruiterNeeds(allSports);
  };

  const updateEducationLevel = (level: EducationLevel) => {
    update("educationLevel", level);
    update("institutionType", institutionTypeForEducation(level));
    if (level === "high_school") {
      update("division", "");
      update("conference", "");
    } else {
      update("teamLevel", "");
    }
  };

  const addHistory = () => {
    const hasValidStart = monthYearPattern.test(draftHistory.startYear);
    const hasValidEnd = !draftHistory.endYear.trim() || monthYearPattern.test(draftHistory.endYear);
    if (!draftHistory.name.trim() || !hasValidStart || !hasValidEnd) return;

    update("institutionHistory", [
      ...data.institutionHistory,
      {
        ...draftHistory,
        id: crypto.randomUUID(),
        name: draftHistory.name.trim(),
        endYear: draftHistory.endYear.trim() || "Present",
      },
    ]);
    setDraftHistory({ id: "", name: "", type: "high_school", startYear: "", endYear: "" });
  };

  const removeHistory = (id: string) => {
    update("institutionHistory", data.institutionHistory.filter((entry) => entry.id !== id));
  };

  const canContinue = () => {
    if (step === 0) return !!data.role;
    if (step === 1) {
      return !!(
        data.fullName.trim() &&
        data.city.trim() &&
        data.country.trim() &&
        (data.country !== "United States" || data.state)
      );
    }
    if (step === 2) {
      if (isAthlete) {
        return !!(
          data.gender &&
          data.sport &&
          (data.sportPositions[data.sport]?.length ?? 0) > 0
        );
      }
      return !!(
        data.sportCoaching &&
        data.recruitingPositions.length > 0
      );
    }
    if (step === 3) {
      if (isAthlete) {
        return !!(
          data.educationLevel &&
          data.organizationName.trim() &&
          (data.educationLevel === "high_school" ? data.teamLevel : data.division)
        );
      }
      return !!(
        data.title.trim() &&
        data.organizationName.trim() &&
        data.division
      );
    }

    if (isAthlete) {
      return !!(
        data.heightFeet &&
        data.heightInches &&
        data.weight.trim() &&
        data.graduationYear &&
        data.personalStatement.trim() &&
        data.agreeToTerms &&
        data.ageConfirmation
      );
    }

    return !!(
      data.personalStatement.trim() &&
      (data.programWebsite.trim() || data.schoolWebsite.trim() || data.instagramHandle.trim() || data.twitterHandle.trim()) &&
      data.agreeToTerms
    );
  };

  const handleNext = () => {
    if (!canContinue()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      void handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (step === 0) {
      onBack?.();
      return;
    }
    if (presetRole && step === 1) {
      onBack?.();
      return;
    }
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user || !data.role) return;
    setIsLoading(true);

    try {
      const token = await getToken();
      const height = data.role === "athlete" && data.heightFeet && data.heightInches
        ? `${data.heightFeet}'${data.heightInches}"`
        : "";
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("email", user.email || "");
      formData.append("role", data.role);
      formData.append("profileData", JSON.stringify({ ...data, height }));

      if (data.profileImage instanceof File) {
        formData.append("profileImage", data.profileImage);
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.validationErrors) {
          const errorList = Object.entries(errorData.validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join("\n");
          throw new Error(`${errorData.error}\n${errorList}`);
        }
        throw new Error(errorData.error || "Failed to create profile");
      }

      await authClient.getSession({ query: { disableCookieCache: true } }).catch(() => null);
      window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
    } catch (error) {
      console.error("Error during onboarding:", error);
      alert(`Something went wrong: ${error instanceof Error ? error.message : "Please try again."}`);
      setIsLoading(false);
    }
  };

  if (isLoading && data.role) {
    return <LoadingScreen role={data.role} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="text-sm font-semibold uppercase tracking-wide text-[#01ae79]">
              Step {step + 1} of {steps.length}
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
              {data.role && step > 0 ? `Complete your ${currentRole} profile` : "Set up your UpDrafted profile"}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {data.role && step > 0
                ? "Add the details that make your profile clear, searchable, and ready for real recruiting conversations."
                : "Pick the profile type that fits you. The rest of onboarding will adapt from there."}
            </p>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Step</div>
            <div className="font-semibold text-foreground">{steps[step]}</div>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#01ae79] transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-8">

          {step === 0 && (
            <section className="space-y-7">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-normal">Choose your profile type.</h2>
                <p className="text-sm text-muted-foreground">Your onboarding will change based on what you pick here.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {profileTypes.map((option) => {
                  const Icon = option.icon;
                  const active = data.role === option.role;
                  return (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => update("role", option.role)}
                      className={cn(
                        "relative min-h-48 rounded-md border bg-card p-5 text-left shadow-sm transition hover:border-[#01ae79]",
                        active ? "border-[#01ae79] ring-2 ring-[#01ae79]/20" : "border-border"
                      )}
                    >
                      {active && <Check className="absolute right-4 top-4 size-5 rounded-full bg-[#01ae79] p-1 text-white" />}
                      <Icon className="mb-5 size-8 text-foreground" />
                      <h2 className="text-base font-bold">{option.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-7">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-normal">Start with the basics.</h2>
                <p className="text-sm text-muted-foreground">Add the details people need to recognize and locate your {currentRole} profile.</p>
              </div>

              <div className="grid gap-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Profile Photo</Label>
                  <ProfilePictureUpload
                    id="profileImage"
                    value={data.profileImagePreview}
                    variant="compact"
                    onChange={handleProfilePictureChange}
                    onRemove={() => {
                      update("profileImage", null);
                      update("profileImagePreview", "");
                    }}
                  />
                </div>
                <div className="grid content-start gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required className="sm:col-span-2">
                    <Input value={data.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Your full name" className="h-12 bg-background" />
                  </Field>
                  <Field label="Country" required className="sm:col-span-2">
                    <Select value={data.country} onValueChange={(value) => update("country", value)}>
                      <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Country" /></SelectTrigger>
                      <SelectContent>{countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="City" required>
                    <Input value={data.city} onChange={(event) => update("city", event.target.value)} placeholder="City" className="h-12 bg-background" />
                  </Field>
                  <Field label="State" required className={cn(data.country === "United States" ? "" : "invisible")}>
                    <Select value={data.state} onValueChange={(value) => update("state", value)} disabled={data.country !== "United States"}>
                      <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>{US_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-7">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-normal">{isAthlete ? "What's your game?" : "Which sport are you recruiting?"}</h2>
                <p className="text-sm text-muted-foreground">
                  {isAthlete
                    ? "Choose men's or women's sports first, then add sports and positions."
                    : "Choose your sport and the positions you need right now."}
                </p>
              </div>

              {isAthlete && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.entries(SPORT_GENDER_LABELS) as Array<[SportGenderCategory, string]>).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateGender(value)}
                      className={cn(
                        "min-h-14 rounded-md border bg-card p-4 text-left text-sm font-semibold shadow-sm transition hover:border-[#01ae79]",
                        selectedSportGender === value ? "border-[#01ae79] ring-2 ring-[#01ae79]/20" : "border-border"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {isAthlete && !selectedSportGender && (
                <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  Select a sport category to show the matching sports, search options, and positions.
                </div>
              )}

              {(!isAthlete || selectedSportGender) && (
                <SportPickerGrid
                  label="Primary Sport"
                  value={isAthlete ? data.sport : data.sportCoaching}
                  onChange={updatePrimarySport}
                  userGender={isAthlete ? selectedSportGender : null}
                />
              )}

              {((isAthlete && selectedSportGender) || data.role === "recruiter") && (
                <Field label={isAthlete ? "Secondary Sports" : "Additional Sports You Recruit"}>
                  <UnifiedSportSelector
                    mode="multi"
                    selectedSports={isAthlete ? data.secondarySports : data.secondarySportsRecruiting}
                    onSportsChange={updateSecondarySports}
                    excludeSports={[(isAthlete ? data.sport : data.sportCoaching)].filter(Boolean)}
                    userGender={isAthlete ? selectedSportGender : null}
                    userCurrentSport={isAthlete ? data.sport : data.sportCoaching}
                    placeholder="Add another sport"
                    maxSelection={8}
                    className="h-12 bg-background"
                  />
                </Field>
              )}

              {isAthlete && selectedSportGender && selectedSports.map((sport) => (
                <PositionGrid
                  key={sport}
                  title={`${formatSportName(sport)} positions`}
                  positions={getPositionsForSport(sport)}
                  selected={data.sportPositions[sport] ?? []}
                  onToggle={(position) => toggleSportPosition(sport, position)}
                />
              ))}

              {isCoachOrRecruiter && data.sportCoaching && (
                <>
                  <PositionGrid
                    title="Positions Needed"
                    positions={primaryPositions}
                    selected={data.recruitingPositions}
                    onToggle={toggleRecruitingPosition}
                  />
                  <Field label="Scholarships Available">
                    <Input
                      type="number"
                      min="0"
                      value={data.scholarshipsAvailable ?? ""}
                      onChange={(event) => {
                        const value = event.target.value ? parseInt(event.target.value, 10) : null;
                        update("scholarshipsAvailable", value);
                        syncRecruiterNeeds(selectedSports, data.recruitingPositions, value);
                      }}
                      placeholder="e.g. 5"
                      className="h-12 bg-background"
                    />
                  </Field>
                </>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-7">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-normal">{isAthlete ? "Tell us where you've played." : "Add your current institution."}</h2>
                <p className="text-sm text-muted-foreground">
                  {isAthlete ? "Set your current athlete context and add school or team history." : "Coaches and recruiters only need their current program here."}
                </p>
              </div>

              {isAthlete ? (
                <>
                  <div className="grid gap-4">
                    <Field label="Education Level" required>
                      <Select value={data.educationLevel} onValueChange={(value) => updateEducationLevel(value as EducationLevel)}>
                        <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Education level" /></SelectTrigger>
                        <SelectContent>{educationOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <SchoolSelector
                    value={data.organizationName}
                    onValueChange={(value) => update("organizationName", value)}
                    placeholder={`Start typing ${schoolClassificationLabel(institutionTypeForEducation(data.educationLevel)).toLowerCase()}...`}
                    label="Current School / Team"
                    required
                    labelClassName="text-sm font-semibold"
                    educationLevel={data.educationLevel}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.educationLevel === "high_school" ? (
                      <Field label="Team Level" required className="sm:col-span-2">
                        <Select value={data.teamLevel || ""} onValueChange={(value) => update("teamLevel", value)}>
                          <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Select team level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="varsity">Varsity</SelectItem>
                            <SelectItem value="jv">Junior Varsity</SelectItem>
                            <SelectItem value="freshman">Freshman</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : (
                      <>
                        <Field label="Division" required>
                          <Select value={data.division} onValueChange={(value) => update("division", value)}>
                            <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Select division" /></SelectTrigger>
                            <SelectContent>{DIVISIONS.filter((division) => division !== "High School").map((division) => <SelectItem key={division} value={division}>{division}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <ConferenceSelector
                          division={data.division}
                          value={data.conference}
                          onValueChange={(value) => update("conference", value)}
                          placeholder="Select conference"
                          label="Conference"
                          labelClassName="text-sm font-semibold"
                          height="h-12"
                          reserveSpace
                        />
                      </>
                    )}
                  </div>

                  <Field label={data.educationLevel === "high_school" ? "Intended Major" : "Current Major"}>
                    <Input value={data.intendedMajor} onChange={(event) => update("intendedMajor", event.target.value)} placeholder="e.g. Business Administration" className="h-12 bg-background" />
                  </Field>

                  <div className="space-y-4">
                    {data.institutionHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-4 rounded-md border border-border bg-card p-4 shadow-sm">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{entry.name}</div>
                          <div className="text-xs text-muted-foreground">{schoolClassificationLabel(entry.type)} - {entry.startYear} to {entry.endYear}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeHistory(entry.id)} aria-label="Remove history">
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="rounded-md border border-dashed border-border p-4">
                      <p className="mb-3 text-xs text-muted-foreground">Use MM/YYYY for dates, like 08/2024. Leave end blank if you are still there.</p>
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_130px_130px]">
                        <Input value={draftHistory.name} onChange={(event) => setDraftHistory({ ...draftHistory, name: event.target.value })} placeholder="School / team name" className="h-11 bg-background" />
                        <Select value={draftHistory.type} onValueChange={(value) => setDraftHistory({ ...draftHistory, type: value as InstitutionType })}>
                          <SelectTrigger className="!h-11 w-full bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>{institutionTypes.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input
                          value={draftHistory.startYear}
                          onChange={(event) => setDraftHistory({ ...draftHistory, startYear: formatMonthYearInput(event.target.value) })}
                          placeholder="Start MM/YYYY"
                          inputMode="numeric"
                          pattern="(0[1-9]|1[0-2])/\\d{4}"
                          title="Use MM/YYYY, like 08/2024"
                          className="h-11 bg-background"
                        />
                        <Input
                          value={draftHistory.endYear}
                          onChange={(event) => setDraftHistory({ ...draftHistory, endYear: formatMonthYearInput(event.target.value) })}
                          placeholder="End MM/YYYY"
                          inputMode="numeric"
                          pattern="(0[1-9]|1[0-2])/\\d{4}"
                          title="Use MM/YYYY, like 05/2026"
                          className="h-11 bg-background"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-3"
                        onClick={addHistory}
                        disabled={
                          !draftHistory.name.trim() ||
                          !monthYearPattern.test(draftHistory.startYear) ||
                          (!!draftHistory.endYear.trim() && !monthYearPattern.test(draftHistory.endYear))
                        }
                      >
                        <Plus className="size-4" /> Add School / Team
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" required>
                      <Input value={data.title} onChange={(event) => update("title", event.target.value)} placeholder={data.role === "coach" ? "Head Coach" : "Recruiting Coordinator"} className="h-12 bg-background" />
                    </Field>
                    <SchoolSelector
                      value={data.organizationName}
                      onValueChange={(value) => update("organizationName", value)}
                      placeholder="Start typing institution..."
                      label="Institution"
                      required
                      labelClassName="text-sm font-semibold"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Division" required>
                      <Select value={data.division} onValueChange={(value) => update("division", value)}>
                        <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Select division" /></SelectTrigger>
                        <SelectContent>{DIVISIONS.map((division) => <SelectItem key={division} value={division}>{division}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <ConferenceSelector
                      division={data.division}
                      value={data.conference}
                      onValueChange={(value) => update("conference", value)}
                      placeholder="Select conference"
                      label="Conference"
                      labelClassName="text-sm font-semibold"
                      height="h-12"
                      reserveSpace
                    />
                  </div>
                </>
              )}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-7">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-normal">{isAthlete ? "Add some flair." : "Finish your profile."}</h2>
                <p className="text-sm text-muted-foreground">{isAthlete ? "This helps coaches find you, and you can update it later." : "Add a useful intro and at least one public link or social handle."}</p>
              </div>

              {isAthlete ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Height" required>
                      <div className="grid grid-cols-2 gap-3">
                        <Select value={data.heightFeet} onValueChange={(value) => update("heightFeet", value)}>
                          <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Feet" /></SelectTrigger>
                          <SelectContent>{Array.from({ length: 5 }, (_, index) => index + 4).map((feet) => <SelectItem key={feet} value={String(feet)}>{feet}&apos;</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={data.heightInches} onValueChange={(value) => update("heightInches", value)}>
                          <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Inches" /></SelectTrigger>
                          <SelectContent>{Array.from({ length: 12 }, (_, inch) => <SelectItem key={inch} value={String(inch)}>{inch}&quot;</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </Field>
                    <Field label="Weight" required>
                      <Input value={data.weight} onChange={(event) => update("weight", event.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 185 lbs" className="h-12 bg-background" />
                    </Field>
                  <Field label="Graduation Year" required className="sm:col-span-2">
                    <Select value={data.graduationYear?.toString() || ""} onValueChange={(value) => update("graduationYear", parseInt(value, 10))}>
                      <SelectTrigger className="!h-12 w-full bg-background"><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>{getGraduationYearsForEducationLevel(data.educationLevel).map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <SocialFields data={data} update={update} className="sm:col-span-2" />
                  <Field label="Bio" required className="sm:col-span-2">
                    <Textarea value={data.personalStatement} onChange={(event) => update("personalStatement", event.target.value)} placeholder="Tell coaches about your playing style, goals, and what you want them to know." className="min-h-32 bg-background p-4" />
                  </Field>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Program Website">
                    <Input value={data.programWebsite} onChange={(event) => update("programWebsite", event.target.value)} placeholder="athletics.university.edu" className="h-12 bg-background" />
                  </Field>
                  <Field label="School Website">
                    <Input value={data.schoolWebsite} onChange={(event) => update("schoolWebsite", event.target.value)} placeholder="university.edu" className="h-12 bg-background" />
                  </Field>
                  <SocialFields data={data} update={update} className="sm:col-span-2" />
                  <Field label="Bio" required className="sm:col-span-2">
                    <Textarea value={data.personalStatement} onChange={(event) => update("personalStatement", event.target.value)} placeholder="Share your role, program context, and what athletes should know before reaching out." className="min-h-32 bg-background p-4" />
                  </Field>
                </div>
              )}

              <TermsAndConditions
                agreeToTerms={data.agreeToTerms}
                ageConfirmation={data.ageConfirmation}
                role={data.role}
                onInputChange={(field, value) => update(field as keyof OnboardingFormData, value)}
              />
            </section>
          )}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        {step > 0 ? (
            <Button variant="ghost" onClick={handlePrevious}>
              <ArrowLeft className="size-4" /> Back
            </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={handleNext}
          disabled={!canContinue() || isLoading}
          className="h-11 bg-[#01ae79] px-7 text-white hover:bg-[#01ae79]/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {step === steps.length - 1 ? "Complete" : "Continue"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-semibold">
        {label}{required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}

function SportPickerGrid({
  label,
  value,
  onChange,
  userGender,
}: {
  label: string;
  value: string;
  onChange: (sport: string) => void;
  userGender: SportGenderCategory | null;
}) {
  const featured = userGender
    ? FEATURED_ONBOARDING_SPORTS[userGender]
    : ["Basketball (M)", "Soccer (M)", "Soccer (W)", "Volleyball (W)"];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">{label} *</Label>
      <div className="grid grid-cols-2 gap-3">
        {featured.map((sport) => {
          const active = value === sport;
          return (
            <button
              key={sport}
              type="button"
              onClick={() => onChange(sport)}
              className={cn(
                "relative min-h-24 rounded-md border bg-card p-4 text-center shadow-sm transition hover:border-[#01ae79]",
                active ? "border-[#01ae79]" : "border-border"
              )}
            >
              {active && <Check className="absolute right-3 top-3 size-5 rounded-full bg-[#01ae79] p-1 text-white" />}
              <Trophy className="mx-auto mb-2 size-7 text-foreground" />
              <span className="text-sm font-semibold">{formatSportName(sport)}</span>
            </button>
          );
        })}
      </div>
      <UnifiedSportSelector
        mode="single"
        value={value}
        onValueChange={onChange}
        placeholder="Search other sports..."
        userGender={userGender}
        userCurrentSport={value}
        className="h-12 bg-background"
      />
    </div>
  );
}

function PositionGrid({
  title,
  positions,
  selected,
  onToggle,
}: {
  title: string;
  positions: string[];
  selected: string[];
  onToggle: (position: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredPositions = positions.filter((position) =>
    position.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (positions.length === 0) return null;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-semibold">{title} *</Label>
          <p className="text-xs text-muted-foreground">
            {selected.length > 0 ? `${selected.length} selected` : "Search and select every position that applies."}
          </p>
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search positions..."
          className="h-10 bg-background sm:w-72"
        />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => onToggle(position)}
              className="inline-flex h-8 items-center gap-2 rounded-md bg-muted px-3 text-xs font-semibold text-foreground"
            >
              {position}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-background p-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filteredPositions.map((position) => (
            <label key={position} className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-card px-3 text-sm shadow-sm">
              <Checkbox checked={selected.includes(position)} onCheckedChange={() => onToggle(position)} />
              {position}
            </label>
          ))}
          {filteredPositions.length === 0 && (
            <div className="col-span-full px-3 py-6 text-center text-sm text-muted-foreground">
              No positions match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialFields({
  data,
  update,
  className,
}: {
  data: OnboardingFormData;
  update: (field: keyof OnboardingFormData, value: FieldValue) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <Field label="Instagram">
        <SocialInput value={data.instagramHandle} onChange={(event) => update("instagramHandle", event.target.value)} placeholder="yourusername" className="h-12 bg-background" />
      </Field>
      <Field label="X">
        <SocialInput value={data.twitterHandle} onChange={(event) => update("twitterHandle", event.target.value)} placeholder="yourusername" className="h-12 bg-background" />
      </Field>
    </div>
  );
}
