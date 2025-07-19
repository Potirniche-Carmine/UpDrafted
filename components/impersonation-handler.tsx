"use client";

import { useEffect, useState } from 'react';
import { useSignIn, useUser, useAuth } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';

export function ImpersonationHandler() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const handleImpersonation = async () => {
      if (!isLoaded) return;
      
      const ticket = searchParams?.get('__clerk_ticket');
      if (!ticket) return;

      // Prevent multiple simultaneous impersonation attempts
      if (isImpersonating) return;

      setIsImpersonating(true);

      try {
        // If user is already signed in, sign them out first
        if (isSignedIn) {
          await signOut();
          // Wait a moment for the sign out to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Now consume the actor token
        const { createdSessionId } = await signIn.create({
          strategy: 'ticket',
          ticket: ticket,
        });

        // Set the session as active
        await setActive({ session: createdSessionId });

        // Remove the ticket from URL to clean it up
        const url = new URL(window.location.href);
        url.searchParams.delete('__clerk_ticket');
        
        // Use replace to avoid adding to browser history
        router.replace(url.pathname + url.search);
        
        console.log('Impersonation successful');
        
      } catch (error) {
        console.error('Failed to impersonate user:', error);
        
        // Clean up the ticket from URL even on error
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('__clerk_ticket');
          router.replace(url.pathname + url.search);
        } catch (urlError) {
          console.error('Failed to clean up URL:', urlError);
        }
        
        // Could optionally redirect to login page or show an error toast
        // For now, we'll just log the error and let the user continue
      } finally {
        setIsImpersonating(false);
      }
    };

    handleImpersonation();
  }, [isLoaded, signIn, setActive, searchParams, router, isImpersonating, isSignedIn, signOut]);

  // This component doesn't render anything visible
  // You could optionally render a loading indicator when isImpersonating is true
  return null;
} 