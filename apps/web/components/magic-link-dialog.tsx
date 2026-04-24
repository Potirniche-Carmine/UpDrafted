"use client";

import { useEffect, useState } from "react";
import { signIn } from "@/lib/auth-client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MagicLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultEmail?: string;
}

export function MagicLinkDialog({
    open,
    onOpenChange,
    defaultEmail = "",
}: MagicLinkDialogProps) {
    const [email, setEmail] = useState(defaultEmail);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    // Update email when defaultEmail changes
    useEffect(() => {
        setEmail(defaultEmail);
    }, [defaultEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await signIn.magicLink({
                email,
                callbackURL: "/dashboard",
                errorCallbackURL: "/sign-in?error=magic-link-failed",
            });
            setIsSuccess(true);
        } catch {
            setError("Failed to send magic link. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        setError("");
        onOpenChange(false);
    };

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Check your email</DialogTitle>
                        <DialogDescription>
                            We have sent a magic link to {email}. Click the link in the email to sign in.
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={handleClose} className="w-full">
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Sign in with Magic Link</DialogTitle>
                    <DialogDescription>
                        Enter your email address and we will send you a magic link to sign in.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="magic-link-email">Email</Label>
                        <Input
                            id="magic-link-email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Magic Link"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
