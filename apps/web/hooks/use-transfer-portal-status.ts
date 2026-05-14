"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export type TransferPortalCommunicationStatus = {
  isD1D2Athlete: boolean;
  hasApprovedTransferPortalVerification: boolean;
  isCommunicationLocked: boolean;
  currentRequestStatus: "pending" | "approved" | "rejected" | null;
};

const DEFAULT_STATUS: TransferPortalCommunicationStatus = {
  isD1D2Athlete: false,
  hasApprovedTransferPortalVerification: false,
  isCommunicationLocked: false,
  currentRequestStatus: null,
};

async function fetchTransferPortalStatus() {
  const response = await fetch("/api/transfer-portal-status", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load transfer portal status");
  }

  const data = await response.json();
  return (data.status ?? DEFAULT_STATUS) as TransferPortalCommunicationStatus;
}

export function useTransferPortalStatus() {
  const { isLoaded, isSignedIn } = useAuth();
  const query = useQuery({
    queryKey: ["transfer-portal-status"],
    queryFn: fetchTransferPortalStatus,
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (!isLoaded) {
    return { status: DEFAULT_STATUS, isLoading: true };
  }

  if (!isSignedIn) {
    return { status: DEFAULT_STATUS, isLoading: false };
  }

  return {
    status: query.data ?? DEFAULT_STATUS,
    isLoading: query.isLoading,
  };
}
