import { useToast } from "@/components/ui/toast";

export interface Connection {
  fromUserId: string;
  toUserId: string;
}

export interface AcceptConnectionParams {
  connectionId: string;
  targetUserId: string | number;
  profileName: string;
  setIsConnecting: (loading: boolean) => void;
  setCurrentConnectionStatus: (status: "none" | "pending" | "connected") => void;
  toast: ReturnType<typeof useToast>;
}

/**
 * Shared utility function to handle accepting connection requests
 * Reduces code duplication across athlete, coach, and recruiter profile components
 */
export const handleAcceptConnection = async ({
  connectionId,
  targetUserId,
  profileName,
  setIsConnecting,
  setCurrentConnectionStatus,
  toast
}: AcceptConnectionParams): Promise<void> => {
  setIsConnecting(true);
  
  try {
    // Check if connectionId is provided and not empty
    if (!connectionId) {
      throw new Error('Connection ID is required to accept connection');
    }
    
    const connectionId_num = Number(connectionId);
    if (isNaN(connectionId_num) || connectionId_num <= 0) {
      throw new Error("Connection ID must be a valid positive number");
    }

    const windowWithClerk = window as unknown as {
      Clerk?: {
        session?: {
          getToken: () => Promise<string>;
        };
      };
    };
    const token = await windowWithClerk.Clerk?.session?.getToken();

    const response = await fetch('/api/connections', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        connectionId: connectionId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Log error details to console
      console.error('Connection acceptance failed:', {
        status: response.status,
        error: errorData.error,
        connectionId: connectionId,
        targetUserId: targetUserId,
        timestamp: new Date().toISOString()
      });

      throw new Error(errorData.error || 'Failed to accept connection request');
    }

    const result = await response.json();
    if (result.success) {
      setCurrentConnectionStatus("connected");
      toast.success(
        "Connection Accepted",
        `You are now connected with ${profileName}`,
        5000
      );
    } else {
      // Log unexpected API response structure to console
      console.error('Unexpected connection acceptance API response:', {
        result,
        connectionId: connectionId,
        targetUserId: targetUserId,
        timestamp: new Date().toISOString()
      });

      throw new Error(result.error || 'Failed to accept connection request');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error accepting connection request:', {
        message: error.message,
        stack: error.stack,
        connectionId: connectionId,
        targetUserId: targetUserId,
        timestamp: new Date().toISOString()
      });

      toast.error(
        "Connection Error",
        "Something went wrong while accepting the connection request. Please try again.",
        7000
      );
    }
  } finally {
    setIsConnecting(false);
  }
};

/**
 * Safely determines the partner user ID from a connection
 * Handles type mismatches and edge cases robustly
 */
export const getPartnerUserId = (currentUserId: string | number, connection: Connection): string => {
  // Check for null or undefined values
  if (currentUserId == null || connection.fromUserId == null || connection.toUserId == null) {
    throw new Error("UserId's are Null.");
  }

  if (typeof currentUserId === 'undefined' || typeof connection.fromUserId === 'undefined' || typeof connection.toUserId === 'undefined') {
    throw new Error("UserId's are Undefined.");
  }

  // Convert to strings safely - at this point we know they're not null/undefined
  const currentId = String(currentUserId);
  const toUserId = String(connection.toUserId);
  const fromUserId = String(connection.fromUserId);
  
  // Safety check - ensure we're not dealing with the same user
  if (currentId === toUserId && currentId === fromUserId) {
    throw new Error('Invalid connection: user cannot be connected to themselves');
  }
  
  return currentId === toUserId ? connection.fromUserId : connection.toUserId;
};

/**
 * Safely determines the original requester ID from a connection
 * The original requester is the one who is NOT the current user
 */
export const getOriginalRequesterId = (currentUserId: string | number, connection: Connection): string => {
  // Check for null or undefined values
  if (currentUserId == null || connection.fromUserId == null || connection.toUserId == null) {
    throw new Error("UserId's are Null.");
  }

  if (typeof currentUserId === 'undefined' || typeof connection.fromUserId === 'undefined' || typeof connection.toUserId === 'undefined') {
    throw new Error("UserId's are Undefined.");
  }

  // Convert to strings safely - at this point we know they're not null/undefined
  const currentId = String(currentUserId);
  const fromUserId = String(connection.fromUserId);
  
  // The original requester is the one who is NOT the current user
  return currentId === fromUserId ? connection.toUserId : connection.fromUserId;
};
