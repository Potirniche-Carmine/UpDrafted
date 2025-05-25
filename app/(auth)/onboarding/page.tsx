"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Trophy, Target } from "lucide-react";
import { fetchGeoapifyData } from "./geoapify";

type UserRole = "athlete" | "coach" | "recruiter";

interface OnboardingData {
  role: UserRole | null;
  // Athlete fields
  sport?: string;
  secondarySports?: string[];
  graduationYear?: number;
  highSchool?: string;
  city?: string;
  state?: string;
  height?: string;
  weight?: string;
  positions?: string[];
  gpa?: number;
  satScore?: number;
  actScore?: number;
  intendedMajor?: string;
  personalStatement?: string;
  // Coach/Recruiter fields
  title?: string;
  sportsCoaching?: string[];
  organizationName?: string;
  division?: string;
  conference?: string;
}



export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<"role" | "details">("role");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({ role: null });
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<string[]>([]);


  const handleRoleSelect = (role: UserRole) => {
    setData({ ...data, role });
    setStep("details");
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setData({ ...data, [field]: value });
  };

  const handleSubmit = async () => {
    if (!user || !data.role) return;
    
    setIsLoading(true);
    try {
      // Create user in database and update Clerk metadata via API
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          fullName: user.fullName || '',
          profileImage: user.imageUrl,
          role: data.role,
          profileData: data
        }),
      });

      if (response.ok) {
        // Redirect to home or dashboard
        router.push('/');
        router.refresh(); // Refresh to update middleware state
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = () => {
    if (!data.role) return false;
    
    if (data.role === 'athlete') {
      return data.sport && data.graduationYear && data.highSchool && 
             data.city && data.state && data.height && data.weight && 
             data.positions?.length;
    } else {
      return data.title && data.organizationName && data.sportsCoaching?.length && 
             data.division && data.city && data.state;
    }
  };

  if (step === "role") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to UpDrafted!</h1>
            <p className="text-xl text-muted-foreground">
              Let&apos;s get you set up. What describes you best?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Athlete Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
              onClick={() => handleRoleSelect("athlete")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Student-Athlete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-4">
                  I&apos;m a high school athlete looking to get recruited for college sports.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Profile Creation</Badge>
                  <Badge variant="outline" className="w-full justify-center">Connect with Coaches</Badge>
                  <Badge variant="outline" className="w-full justify-center">Showcase Skills</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Coach Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500"
              onClick={() => handleRoleSelect("coach")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-4">
                  I&apos;m a college coach looking to recruit talented student-athletes.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Program Showcase</Badge>
                  <Badge variant="outline" className="w-full justify-center">Find Athletes</Badge>
                  <Badge variant="outline" className="w-full justify-center">Recruitment Tools</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recruiter Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-500"
              onClick={() => handleRoleSelect("recruiter")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Recruiter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-4">
                  I&apos;m a recruiting coordinator working across multiple sports programs.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Multi-Sport Access</Badge>
                  <Badge variant="outline" className="w-full justify-center">Athlete Discovery</Badge>
                  <Badge variant="outline" className="w-full justify-center">Program Coordination</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Details form based on role
return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Complete Your {data.role === 'athlete' ? 'Athletic' : 'Coaching'} Profile
          </h1>
          <p className="text-muted-foreground">
            Tell us about yourself to get the most out of UpDrafted
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.role === 'athlete' ? (
              // Athlete Form
              <>
                {/* First Name and Last Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <Input
                      placeholder="John"
                      value={data.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <Input
                      placeholder="Doe"
                      value={data.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                {/* Profile Picture Upload Button */}
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Here you would typically handle the file upload,
                        // e.g., upload to a cloud storage and save the URL
                        console.log("Selected file:", file);
                        // For now, let's assume you store the file object or a temporary URL
                        handleInputChange('profilePicture', file);
                      }
                    }}
                  />
                  {data.profilePicture && typeof data.profilePicture === 'string' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Current: <a href={data.profilePicture} target="_blank" rel="noopener noreferrer">View Image</a>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Sport *</label>
                    <Input
                      placeholder="e.g., Basketball"
                      value={data.sport || ''}
                      onChange={(e) => handleInputChange('sport', e.target.value)}
                    />
                  </div>
                  <div>
                    {/* Secondary Sport Input */}
                    <label className="block text-sm font-medium mb-2">Secondary Sport</label>
                    <Input
                      placeholder="e.g., Track and Field (Optional)"
                      value={data.secondarySport || ''}
                      onChange={(e) => handleInputChange('secondarySport', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Graduation Year *</label>
                    <Input
                      type="number"
                      placeholder="2025"
                      value={data.graduationYear || ''}
                      onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">High School *</label>
                  <Input
                    placeholder="Your High School Name"
                    value={data.highSchool || ''}
                    // ADDED: onChange handler to call fetchGeoapifyData
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      handleInputChange('highSchool', inputValue); // Update your state
                      const data = fetchGeoapifyData(inputValue); // Call your API function
                    }}
                  />
                  {/* You might want to add a div here to display suggestions */}
                  {/* For example:
                  {suggestions.length > 0 && (
                    <ul className="border rounded-md mt-1 max-h-48 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <li 
                          key={index} 
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            handleInputChange('highSchool', suggestion.properties.name);
                            setSuggestions([]); // Clear suggestions after selection
                          }}
                        >
                          {suggestion.properties.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      placeholder="Your City"
                      value={data.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                      placeholder="State"
                      value={data.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Height *</label>
                    <Input
                      placeholder="6'2&quot;"
                      value={data.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight *</label>
                    <Input
                      placeholder="185 lbs"
                      value={data.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Positions *</label>
                  <Input
                    placeholder="e.g., Point Guard, Shooting Guard (comma separated)"
                    value={data.positions?.join(', ') || ''}
                    onChange={(e) => handleInputChange('positions', e.target.value.split(', ').filter(Boolean))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GPA</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="3.85"
                      value={data.gpa || ''}
                      onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SAT Score</label>
                    <Input
                      type="number"
                      placeholder="1320"
                      value={data.satScore || ''}
                      onChange={(e) => handleInputChange('satScore', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Intended Major</label>
                  <Input
                    placeholder="e.g., Business Administration"
                    value={data.intendedMajor || ''}
                    onChange={(e) => handleInputChange('intendedMajor', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Personal Statement</label>
                  <textarea
                    className="w-full p-3 border rounded-md"
                    rows={4}
                    placeholder="Tell coaches about yourself, your goals, and what makes you unique..."
                    value={data.personalStatement || ''}
                    onChange={(e) => handleInputChange('personalStatement', e.target.value)}
                  />
                </div>
              </>
            ) : (
              // Coach/Recruiter Form (unchanged as the request was only for the athlete form)
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    placeholder="e.g., Head Coach, Recruiting Coordinator"
                    value={data.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name *</label>
                  <Input
                    placeholder="e.g., University of Texas Basketball"
                    value={data.organizationName || ''}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sports {data.role === 'recruiter' ? 'You Recruit For' : 'You Coach'} *
                  </label>
                  <Input
                    placeholder="e.g., Basketball, Football (comma separated)"
                    value={data.sportsCoaching?.join(', ') || ''}
                    onChange={(e) => handleInputChange('sportsCoaching', e.target.value.split(', ').filter(Boolean))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Division *</label>
                    <Input
                      placeholder="e.g., NCAA Division I"
                      value={data.division || ''}
                      onChange={(e) => handleInputChange('division', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Conference</label>
                    <Input
                      placeholder="e.g., Big 12"
                      value={data.conference || ''}
                      onChange={(e) => handleInputChange('conference', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      placeholder="Your City"
                      value={data.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                      placeholder="State"
                      value={data.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => setStep("role")}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || isLoading}
                className="flex-1"
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