"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function UserAccountModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Account</DialogTitle>
                    <DialogDescription>
                        Update your account settings here.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
                    </TabsList>

                    <TabsContent value="email">
                        <ChangeEmailForm />
                    </TabsContent>

                    <TabsContent value="password">
                        <ChangePasswordForm />
                    </TabsContent>

                    <TabsContent value="danger">
                        <DeleteAccountForm onClose={() => setOpen(false)} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function ChangeEmailForm() {
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState(""); // Often required to change email
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await authClient.changeEmail({
                newEmail,
                // callbackURL: "/dashboard" // Optional
            });

            if (error) {
                setMessage({ type: 'error', text: error.message || "Failed to change email." });
            } else {
                setMessage({ type: 'success', text: "Verification email sent to new address." });
                setNewEmail("");
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 py-4">
            {message && (
                <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-destructive/10 text-destructive'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@example.com"
                />
            </div>
            {/* Note: Depending on auth config, password might be required. Better Auth changeEmail usually sends verification first. */}
            <Button onClick={handleSubmit} disabled={loading || !newEmail} className="w-full">
                {loading ? "Updating..." : "Update Email"}
            </Button>
        </div>
    );
}

function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: "Password must be at least 8 characters." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await authClient.changePassword({
                newPassword,
                currentPassword,
                revokeOtherSessions: true, // Optional: revoke other sessions
            });

            if (error) {
                setMessage({ type: 'error', text: error.message || "Failed to change password." });
            } else {
                setMessage({ type: 'success', text: "Password changed successfully." });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 py-4">
            {message && (
                <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-destructive/10 text-destructive'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <Button onClick={handleSubmit} disabled={loading || !currentPassword || !newPassword} className="w-full">
                {loading ? "Updating..." : "Update Password"}
            </Button>
        </div>
    );
}

function DeleteAccountForm({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const router = useRouter();
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if (confirmText !== "DELETE") {
            setError("Please type DELETE to confirm.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { error } = await authClient.deleteUser({
                // callbackURL: "/" 
            });

            if (error) {
                setError(error.message || "Failed to delete account.");
                setLoading(false);
            } else {
                // Success - redirect to home
                onClose();
                router.push("/");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 py-4">
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                <h3 className="text-destructive font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Danger Zone
                </h3>
                <p className="text-sm text-destructive/80 mt-1">
                    Deleting your account is permanent. All your data including profiles, messages, and subscriptions will be permanently removed.
                </p>
            </div>

            {error && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
                <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
                <Input
                    id="confirm-delete"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="border-destructive/30 focus-visible:ring-destructive/30"
                />
            </div>

            <Button
                onClick={handleDelete}
                disabled={loading || confirmText !== "DELETE"}
                variant="destructive"
                className="w-full"
            >
                {loading ? "Deleting..." : "Delete Account Permanently"}
            </Button>
        </div>
    );
}
