"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Target } from "lucide-react";

type UserRole = "athlete" | "coach" | "recruiter";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-background pt-8 p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
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
            onClick={() => onRoleSelect("athlete")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Student-Athlete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                Build your athlete profile, showcase film and stats, and connect with verified college programs.
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
            onClick={() => onRoleSelect("coach")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                Use this if you coach a team or program and want to discover athletes for your roster.
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
            onClick={() => onRoleSelect("recruiter")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Recruiter / Athletics Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                For recruiting coordinators, athletics administrators, and other institutional staff who support recruiting but are not coaches.
              </p>
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-center">Multi-Sport Recruiting</Badge>
                <Badge variant="outline" className="w-full justify-center">Athlete Discovery</Badge>
                <Badge variant="outline" className="w-full justify-center">Athletics Staff Profile</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
