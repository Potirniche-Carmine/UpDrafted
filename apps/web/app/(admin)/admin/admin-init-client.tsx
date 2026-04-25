"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { AdminRoleSwitcher } from "@/components/admin-role-switcher";

interface Props {
  userEmail: string;
}

export function AdminInitClient({ userEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInitStatus = async () => {
      try {
        const response = await fetch('/api/admin/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email: userEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.message?.includes('already initialized')) {
            setInitialized(true);
          }
        }
      } catch {
        // If check fails, user can still try manual initialization
      } finally {
        setCheckingStatus(false);
      }
    };

    checkInitStatus();
  }, [userEmail]);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setInitialized(true);
      } else {
        setError(data.error || 'Failed to initialize admin user');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="container mx-auto p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Checking admin status...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (initialized) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Admin Panel
                <Badge variant="default">✅</Badge>
              </CardTitle>
              <CardDescription>
                Your admin account has been set up in the database. You can now use all admin features.
              </CardDescription>
            </CardHeader>
          </Card>

          <AdminRoleSwitcher />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Initialize Admin Account
              <Badge variant="destructive">ADMIN</Badge>
            </CardTitle>
            <CardDescription>
              Your admin role is configured, but you need to initialize your database record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Status:</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Role:</span>
                  <Badge variant="default">Admin ✅</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Database Record:</span>
                  <Badge variant="secondary">Not Created ❌</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Email:</span>
                  <span className="text-muted-foreground">{userEmail}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button onClick={handleInitialize} disabled={loading} className="w-full">
              {loading ? 'Initializing...' : 'Initialize Admin Account'}
            </Button>

            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                This will create your user record in the database with admin role.
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs font-medium text-blue-900 mb-2">Next Steps After Initialization:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
                  <li>Visit <code className="bg-blue-100 px-1 rounded text-xs">/onboarding</code> and complete athlete onboarding</li>
                  <li>Visit <code className="bg-blue-100 px-1 rounded text-xs">/onboarding</code> again and complete coach onboarding</li>
                  <li>Visit <code className="bg-blue-100 px-1 rounded text-xs">/onboarding</code> again and complete recruiter onboarding</li>
                </ol>
                <div className="mt-2 text-xs text-blue-700">
                  Each completion creates a demo profile you can switch between.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
