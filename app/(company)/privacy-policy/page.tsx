"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Shield, Info, UserCog, Database, Cookie, Mail, MessageCircle, ArrowRight } from "lucide-react";

export default function PrivacyPolicyPage() {
    const lastUpdated = "December 2024";

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container px-4 md:px-6 relative">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
                            <Shield className="w-4 h-4 mr-2" />
                            Privacy & Security
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                            Privacy{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                                Policy
                            </span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
                            Your privacy is important to us. This policy explains how UpDrafted collects, uses, and protects your personal information.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* Privacy Content */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6">
                    <div className="max-w-4xl mx-auto space-y-12">

                        <PrivacySection
                            icon={<Info className="h-6 w-6 text-[#01ae79]" />}
                            title="1. Introduction"
                        >
                            <p>Welcome to UpDrafted (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website, mobile applications, and/or any related services (we refer to them collectively in this Privacy Policy as the &quot;Services&quot;).</p>
                            <p className="font-medium text-[#01ae79]">
                                <strong>Age Requirement:</strong> You must be at least 13 years old to use our Services. We do not knowingly collect personal information from children under 13.
                            </p>
                            <p>Our goal is to facilitate connections between student-athletes and college athletic programs. This policy outlines how we handle your data in pursuit of this mission.</p>
                        </PrivacySection>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <PrivacySection
                                    icon={<Database className="h-6 w-6 text-[#01ae79]" />}
                                    title="2. Information We Collect"
                                    isHighlighted={true}
                                >
                                    <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services, or otherwise when you contact us.</p>
                                    <p>The personal information we collect may include the following:</p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                        <li><strong>Personal Information Provided by You:</strong> Name, email address, phone number, date of birth, physical address, academic information (GPA, test scores, school name), athletic information (sport, position, stats, videos, awards), profile picture, and other similar data.</li>
                                        <li><strong>Authentication Data:</strong> For user authentication and account management, we use Clerk. When you sign up or log in via Clerk, they handle your credentials and provide us with user identifiers and basic profile information as configured in our Clerk integration.</li>
                                        <li><strong>Chat Data:</strong> We collect and store messages sent through our platform messaging system. This data is collected only for safety purposes, to investigate reports of inappropriate behavior, and to keep all users safe on our platform.</li>
                                        <li><strong>Connections Data:</strong> We track and store information about connections made between users (athletes, coaches, recruiters) including connection requests, accepted connections, and interaction history to facilitate networking and improve our matching services.</li>
                                        <li><strong>Activity Data:</strong> We collect information about your activity on our website, including pages visited, time spent on pages, features used, search queries, and other usage patterns to improve our services and user experience.</li>
                                        <li><strong>Automatically Collected Information:</strong> IP address, browser type, operating system, access times, pages viewed, and device information when you access our Services.</li>
                                    </ul>
                                </PrivacySection>
                            </CardContent>
                        </Card>

                        <PrivacySection
                            icon={<UserCog className="h-6 w-6 text-[#01ae79]" />}
                            title="3. How We Use Your Information"
                        >
                            <p>We use personal information collected via our Services for a variety of business purposes described below:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li>To facilitate account creation and logon process (via Clerk).</li>
                                <li>To provide and operate the Services (e.g., display athlete profiles to college programs, allow programs to search for athletes).</li>
                                <li>To manage user accounts and provide customer support.</li>
                                <li>To facilitate connections between athletes and college programs.</li>
                                <li>To monitor chat communications for safety and security purposes, and to investigate reports of inappropriate behavior.</li>
                                <li>To analyze website activity and usage patterns to improve our platform and user experience.</li>
                                <li>To send administrative information, such as changes to our terms, conditions, and policies.</li>
                                <li>To personalize and improve your experience on our Services.</li>
                                <li>For our business purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns.</li>
                                <li>To send you marketing and promotional communications if you have opted in. You can opt-out of our marketing emails at any time.</li>
                            </ul>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Shield className="h-6 w-6 text-[#01ae79]" />}
                            title="4. Sharing Your Information"
                        >
                            <p>We may share your information in the following situations:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li><strong>With College Programs:</strong> If you are an athlete, your profile information will be visible to registered and verified college coaches, recruiters, and scouts using our platform.</li>
                                <li><strong>With Athletes:</strong> If you represent a college program, your program information and contact details (as provided) may be visible to athletes you interact with.</li>
                                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers (like Clerk for authentication, hosting providers, analytics providers) who perform services for us or on our behalf.</li>
                                <li><strong>Safety and Security:</strong> We may access and share chat data when investigating reports of harassment, inappropriate behavior, or other safety concerns to protect our users.</li>
                                <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, or legal process.</li>
                                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                            </ul>
                        </PrivacySection>

                        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
                            <CardContent className="p-6">
                                <PrivacySection
                                    icon={<MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                                    title="5. Safety and Security Measures"
                                    isHighlighted={true}
                                >
                                    <p className="font-medium text-blue-800 dark:text-blue-200">We prioritize the safety of all users on our platform:</p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                        <li><strong>Chat Monitoring:</strong> All messages sent through our platform are stored and may be reviewed when reports are filed to ensure user safety and investigate inappropriate behavior.</li>
                                        <li><strong>Connection Tracking:</strong> We monitor connection patterns to identify and prevent potentially harmful or spam behavior.</li>
                                        <li><strong>Activity Analysis:</strong> We analyze user activity to detect unusual patterns that might indicate account compromise or misuse.</li>
                                        <li><strong>Data Security:</strong> We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.</li>
                                    </ul>
                                </PrivacySection>
                            </CardContent>
                        </Card>

                        <PrivacySection
                            icon={<Cookie className="h-6 w-6 text-[#01ae79]" />}
                            title="6. Cookies and Tracking Technologies"
                        >
                            <p>We may use cookies and similar tracking technologies to access or store information and to improve your experience on our platform. This includes tracking your activity data to better understand how you use our Services.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<UserCog className="h-6 w-6 text-[#01ae79]" />}
                            title="7. Your Privacy Rights"
                        >
                            <p>Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. You can typically manage your profile information by logging into your account. For other requests, including questions about your chat data, connections data, or activity data, please contact us.</p>
                            <p className="mt-4">You may request to see what data we have collected about you, including your messaging history, connection records, and activity logs.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Info className="h-6 w-6 text-[#01ae79]" />}
                            title="8. Changes to This Privacy Policy"
                        >
                            <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Mail className="h-6 w-6 text-[#01ae79]" />}
                            title="9. Contact Us"
                        >
                            <p>If you have questions or comments about this Privacy Policy, you may email us at <a href="mailto:potirnichecarmine@gmail.com" className="text-[#01ae79] hover:underline font-medium">potirnichecarmine@gmail.com</a></p>
                        </PrivacySection>

                        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                            <CardContent className="p-6">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Legal Disclaimer:</strong> Please be aware that this Privacy Policy is a provisional document and has not yet been reviewed or approved by legal counsel. It is provided for informational purposes only and is subject to revision. It does not constitute legal advice and should not be relied upon as such.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50/50 to-[#01ae79]/5 dark:from-slate-950/50 dark:to-[#01ae79]/10">
                <div className="container px-4 md:px-6">
                    <div className="text-center space-y-8 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Your Privacy Matters
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We&apos;re committed to protecting your data while helping you make meaningful connections.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/">
                                <Button variant="outline" size="lg" className="border-[#01ae79]/30 dark:border-[#01ae79]/30 text-[#01ae79] hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10">
                                    Back to Home
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button size="lg" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white group">
                                    Join UpDrafted
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

interface PrivacySectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    isHighlighted?: boolean;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ icon, title, children, isHighlighted = false }) => (
    <div className="space-y-4">
        <h2 className={`text-2xl font-semibold flex items-start gap-3 ${isHighlighted ? 'text-emerald-800 dark:text-emerald-200' : 'text-foreground'}`}>
            {icon}
            {title}
        </h2>
        <div className={`space-y-4 text-muted-foreground leading-relaxed ${isHighlighted ? '' : 'pl-9'}`}>
            {children}
        </div>
    </div>
);