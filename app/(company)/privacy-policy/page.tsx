"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Shield, Info, UserCog, Database, Cookie, Mail, MessageCircle, ArrowRight, Crown, Activity } from "lucide-react";

export default function PrivacyPolicyPage() {
    const lastUpdated = "January 2025";

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
                            <p>Our goal is to facilitate connections between student-athletes and college athletic programs. This policy outlines how we handle your data in pursuit of this mission, including our encrypted messaging system and premium features that require enhanced activity tracking.</p>
                        </PrivacySection>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <PrivacySection
                                    icon={<Database className="h-6 w-6 text-[#01ae79]" />}
                                    title="2. Information We Collect"
                                    isHighlighted={true}
                                >
                                    <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services, or otherwise when you contact us.</p>
                                    <p><strong>We automatically collect comprehensive data from all users, including:</strong></p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                        <li><strong>Personal Information Provided by You:</strong> Name, email address, phone number, date of birth, physical address, academic information (GPA, test scores, school name), athletic information (sport, position, stats, videos, awards), profile picture, and other similar data.</li>
                                        <li><strong>Authentication Data:</strong> For user authentication and account management, we use Clerk. When you sign up or log in via Clerk, they handle your credentials and provide us with user identifiers and basic profile information as configured in our Clerk integration.</li>
                                        <li><strong>Encrypted Messages:</strong> All messages sent through our platform are encrypted for your privacy and security. These encrypted messages are stored securely and are only accessible under specific safety circumstances as outlined in Section 4.</li>
                                        <li><strong>Connections Data:</strong> We track and store information about connections made between users (athletes, coaches, recruiters) including connection requests, accepted connections, and interaction history to facilitate networking and improve our matching services.</li>
                                        <li><strong>Comprehensive Activity Data (All Users):</strong> We continuously collect detailed activity information from all users including page views, time spent on profiles, click patterns, search queries, scroll behavior, feature usage, interaction patterns, login/logout times, session duration, device information, and comprehensive engagement metrics.</li>
                                        <li><strong>Profile Interaction Analytics:</strong> We track whose profiles you view, when you view them, how long you spend viewing them, what sections you access, and detailed interaction patterns across all user sessions.</li>
                                        <li><strong>Communication Analytics:</strong> We track message read status, response times, messaging patterns, and communication behaviors for all users to improve platform functionality and enable premium features.</li>
                                        <li><strong>Cross-Platform and Cross-Session Data:</strong> We connect your activity across different sessions, devices, and time periods to create comprehensive user profiles and usage analytics.</li>
                                        <li><strong>Automatically Collected Information:</strong> IP address, browser type, operating system, access times, pages viewed, device information, and detailed behavioral analytics when you access our Services.</li>
                                    </ul>
                                    <p className="mt-4"><strong>Data Collection Scope:</strong> This data collection occurs automatically and continuously for all users as a core function of our platform, similar to professional networking platforms like LinkedIn.</p>
                                </PrivacySection>
                            </CardContent>
                        </Card>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <PrivacySection
                                    icon={<MessageCircle className="h-6 w-6 text-[#01ae79]" />}
                                    title="3. Encrypted Messaging System"
                                    isHighlighted={true}
                                >
                                    <p className="font-medium text-[#01ae79]">We take your privacy seriously with our encrypted messaging system:</p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                    </ul>
                                    <p className="mt-4 font-medium text-[#01ae79]">By using our messaging system, you consent to this safety-focused access model as necessary for maintaining a secure environment for all users.</p>
                                </PrivacySection>
                            </CardContent>
                        </Card>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <PrivacySection
                                    icon={<Crown className="h-6 w-6 text-[#01ae79]" />}
                                    title="4. Universal Data Collection and Premium Access"
                                    isHighlighted={true}
                                >
                                    <p className="font-medium text-[#01ae79]">UpDrafted collects comprehensive data from all users continuously, but only premium subscribers can access detailed analytics about their activity and others&apos; interactions with their profile.</p>
                                    <p className="mt-4"><strong>Universal Data Collection:</strong> We collect detailed activity data from all users including:</p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                        <li><strong>Comprehensive Activity Logs:</strong> All website activity, page visits, time spent on profiles, click patterns, scroll behavior, and feature usage for every user.</li>
                                        <li><strong>Profile Interaction Data:</strong> Detailed records of profile views, interaction patterns, and engagement metrics across all user activities.</li>
                                        <li><strong>Read Receipts and Message Analytics:</strong> Message read status, response times, and communication patterns tracked for all users regardless of subscription status.</li>
                                        <li><strong>Session Analytics:</strong> Login/logout times, session duration, device information, and behavioral patterns during all user sessions.</li>
                                        <li><strong>Search and Discovery Analytics:</strong> Search queries, filters used, results viewed, and interaction preferences for all platform users.</li>
                                        <li><strong>Cross-Platform Analytics:</strong> Activity connections across sessions, devices, and time periods to create comprehensive user profiles.</li>
                                    </ul>
                                    <p className="mt-4"><strong>Premium Access Model:</strong> While we collect this data from all users, only premium subscribers can:</p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                        <li>View who has visited their profile and when</li>
                                        <li>Access read receipts and message analytics</li>
                                        <li>See detailed activity insights and engagement metrics</li>
                                        <li>Access advanced search and discovery analytics</li>
                                        <li>View comprehensive interaction and engagement reports</li>
                                    </ul>
                                    <p className="mt-4"><strong>Liability and Consent:</strong> By using our platform, you consent to all data collection practices. UpDrafted is not liable for any consequences resulting from data collection, analysis, or use. Data collection occurs automatically for all users as a core platform function.</p>
                                    <p className="mt-4 font-medium text-[#01ae79]">
                                        <strong>Opt-Out:</strong> If you do not consent to comprehensive data tracking, please contact <a href="mailto:support@updrafted.us" className="text-[#01ae79] hover:underline">support@updrafted.us</a> to discuss account limitations or termination.
                                    </p>
                                </PrivacySection>
                            </CardContent>
                        </Card>

                        <PrivacySection
                            icon={<UserCog className="h-6 w-6 text-[#01ae79]" />}
                            title="5. How We Use Your Information"
                        >
                            <p>We use personal information collected via our Services for a variety of business purposes described below:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li>To facilitate account creation and logon process (via Clerk).</li>
                                <li>To provide and operate the Services (e.g., display athlete profiles to college programs, allow programs to search for athletes).</li>
                                <li>To manage user accounts and provide customer support.</li>
                                <li>To facilitate connections between athletes and college programs.</li>
                                <li>To maintain our encrypted messaging system and investigate safety reports when submitted.</li>
                                <li>To provide premium features including profile view tracking, advanced analytics, and enhanced messaging features for subscribers.</li>
                                <li>To analyze website activity and usage patterns to improve our platform and user experience.</li>
                                <li>To send administrative information, such as changes to our terms, conditions, and policies.</li>
                                <li>To personalize and improve your experience on our Services.</li>
                                <li>For our business purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns.</li>
                                <li>To send you marketing and promotional communications if you have opted in. You can opt-out of our marketing emails at any time.</li>
                            </ul>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Shield className="h-6 w-6 text-[#01ae79]" />}
                            title="6. Sharing Your Information"
                        >
                            <p>We may share your information in the following situations:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li><strong>With College Programs:</strong> If you are an athlete, your profile information will be visible to registered and verified college coaches, recruiters, and scouts using our platform.</li>
                                <li><strong>With Athletes:</strong> If you represent a college program, your program information and contact details (as provided) may be visible to athletes you interact with.</li>
                                <li><strong>Premium Feature Sharing:</strong> If you have premium features, your profile view activity may be visible to other premium users whose profiles you view, and their activity may be visible to you.</li>
                                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers (like Clerk for authentication, hosting providers, analytics providers) who perform services for us or on our behalf.</li>
                                <li><strong>Safety and Security:</strong> We may access and share encrypted message data and activity logs when investigating reports of harassment, inappropriate behavior, or other safety concerns to protect our users.</li>
                                <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, or legal process.</li>
                                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                            </ul>
                        </PrivacySection>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <PrivacySection
                                    icon={<Activity className="h-6 w-6 text-[#01ae79]" />}
                                    title="7. Data Security and Safety Measures"
                                    isHighlighted={true}
                                >
                                    <p className="font-medium text-[#01ae79]">We implement comprehensive security measures to protect your data:</p>
                                    <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                        <li><strong>Encryption:</strong> All messages are encrypted using industry-standard encryption protocols to protect your communications.</li>
                                        <li><strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access user data, and only for legitimate safety or support purposes.</li>
                                        <li><strong>Safety Monitoring:</strong> We monitor platform activity to identify and prevent potentially harmful or inappropriate behavior patterns.</li>
                                        <li><strong>Data Minimization:</strong> We collect only the data necessary to provide our services, with enhanced collection limited to premium subscribers who have explicitly consented.</li>
                                        <li><strong>Secure Storage:</strong> All user data is stored using secure, encrypted databases with regular security audits and updates.</li>
                                        <li><strong>Regular Reviews:</strong> We regularly review our security practices and update them to maintain the highest standards of data protection.</li>
                                    </ul>
                                </PrivacySection>
                            </CardContent>
                        </Card>

                        <PrivacySection
                            icon={<Cookie className="h-6 w-6 text-[#01ae79]" />}
                            title="8. Cookies and Tracking Technologies"
                        >
                            <p>We use cookies and similar tracking technologies to access or store information and to improve your experience on our platform. This includes:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li><strong>Essential Cookies:</strong> Required for basic platform functionality and security.</li>
                                <li><strong>Analytics Cookies:</strong> Used to understand how you use our Services and improve user experience.</li>
                                <li><strong>Premium Feature Cookies:</strong> For premium subscribers, additional cookies enable advanced features like detailed activity tracking and profile view analytics.</li>
                            </ul>
                            <p className="mt-4">You can control cookie preferences through your browser settings, though disabling certain cookies may limit platform functionality.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<UserCog className="h-6 w-6 text-[#01ae79]" />}
                            title="9. Your Privacy Rights"
                        >
                            <p>Depending on your location, you may have certain rights regarding your personal information. You can typically manage your profile information by logging into your account. For other requests, please contact us.</p>
                            <p className="mt-4"><strong>You have the right to request:</strong></p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li>Access to your personal data, including messaging history and activity logs</li>
                                <li>Correction of inaccurate personal data</li>
                                <li>Deletion of your personal data (subject to legal and safety retention requirements)</li>
                                <li>Restriction of processing in certain circumstances</li>
                                <li>Data portability for data you provided to us</li>
                                <li>Information about what premium activity tracking data we have collected about you</li>
                            </ul>
                            <p className="mt-4"><strong>Premium Subscription Management:</strong> You can cancel your premium subscription at any time to stop enhanced activity tracking. Contact us for assistance with subscription management or to understand what data is collected under premium features.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Info className="h-6 w-6 text-[#01ae79]" />}
                            title="10. Changes to This Privacy Policy"
                        >
                            <p>We may update this Privacy Policy from time to time, especially as we introduce new features or enhance existing services. The updated version will be indicated by an updated &quot;Last Updated&quot; date. Material changes, particularly those affecting our messaging system or premium feature data collection, will be communicated to users with advance notice.</p>
                            <p className="mt-4">We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Mail className="h-6 w-6 text-[#01ae79]" />}
                            title="11. Contact Us"
                        >
                            <p>If you have questions or comments about this Privacy Policy, including questions about our encrypted messaging system, premium features, or your data rights, you may contact us at:</p>
                            <p className="mt-2 font-medium"><a href="mailto:support@updrafted.us" className="text-[#01ae79] hover:underline">support@updrafted.us</a></p>
                            <p className="mt-4">For privacy-related inquiries, please include &quot;Privacy Policy&quot; in the subject line to ensure prompt attention to your request.</p>
                        </PrivacySection>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <p className="text-sm text-[#01ae79]">
                                    <strong>Legal Disclaimer:</strong> Please be aware that this Privacy Policy is a provisional document and has not yet been reviewed or approved by legal counsel. It is provided for informational purposes only and is subject to revision. It does not constitute legal advice and should not be relied upon as such. We strongly recommend consulting with qualified legal counsel for any privacy-related legal questions or concerns.
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
                            We&apos;re committed to protecting your data while helping you make meaningful connections through secure, encrypted communications.
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
        <h2 className={`text-2xl font-semibold flex items-start gap-3 ${isHighlighted ? 'text-[#01ae79]' : 'text-foreground'}`}>
            {icon}
            {title}
        </h2>
        <div className={`space-y-4 text-muted-foreground leading-relaxed ${isHighlighted ? '' : 'pl-9'}`}>
            {children}
        </div>
    </div>
);