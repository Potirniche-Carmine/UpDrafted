"use client";

import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import React from "react";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  afterSignOutUrl: string;
  appearanceVariables?: Record<string, string>;
}

export function ClerkProviderWrapper({
  children,
  afterSignOutUrl,
  appearanceVariables,
}: ClerkProviderWrapperProps) {
  const { resolvedTheme } = useTheme();

  return (
    <OriginalClerkProvider
      afterSignOutUrl={afterSignOutUrl}
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: { ...appearanceVariables },
      }}
    >
      {children}
    </OriginalClerkProvider>
  );
}