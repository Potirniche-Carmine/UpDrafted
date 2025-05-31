"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Scale, Info, UserCheck, AlertTriangle, FileText, Mail, Shield, ArrowRight } from "lucide-react";

export default function TermsOfServicePage() {
    const lastUpdated = "June 2025";
    const effectiveDate = "June 2025";

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container px-4 md:px-6 relative">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
                            <Scale className="w-4 h-4 mr-2" />
                            Legal Information
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                            Terms of{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                                Service
                            </span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
                            Please read these Terms of Service carefully before using the UpDrafted platform.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* Terms Content */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6">
                    <div className="max-w-4xl mx-auto space-y-12">

                        <TermsSection
                            icon={<Info className="h-6 w-6 text-[#01ae79]" />}
                            title="1. Acceptance of Terms"
                        >
                            <p>By accessing or using the UpDrafted website, mobile applications, and related services (collectively, the &quot;Service&quot;), provided by UpDrafted (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not use the Service. These Terms apply to all users of the Service, including athletes, parents/guardians, coaches, recruiters, scouts, and college program representatives.</p>
                        </TermsSection>

                        <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 bg-[#01ae79]/5 dark:bg-[#01ae79]/10">
                            <CardContent className="p-6">
                                <TermsSection
                                    icon={<UserCheck className="h-6 w-6 text-[#01ae79]" />}
                                    title="2. User Accounts & Eligibility"
                                    isHighlighted={true}
                                >
                                    <p className="font-medium text-[#01ae79]">
                                        <strong>Age Requirement:</strong> You must be at least 13 years old to create an account and use the Service.
                                    </p>
                                    <p>To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
                                    <p>If you are under 18, you represent that you have your parent or guardian&apos;s permission to use the Service and that they have read and agreed to these Terms on your behalf.</p>
                                </TermsSection>
                            </CardContent>
                        </Card>

                        <TermsSection
                            icon={<FileText className="h-6 w-6 text-[#01ae79]" />}
                            title="3. User Conduct and Content"
                        >
                            <p>You are solely responsible for all content (information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials - &quot;Content&quot;) that you upload, post, publish, display, or otherwise transmit via the Service. You agree not to use the Service to:</p>
                            <ul className="list-disc list-inside space-y-2 pl-4 mt-4">
                                <li>Upload any Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another&apos;s privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
                                <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                                <li>Upload any Content that you do not have a right to transmit under any law or under contractual or fiduciary relationships.</li>
                                <li>Violate any applicable local, state, national, or international law, or any regulations having the force of law, including NCAA and NJCAA rules and regulations.</li>
                            </ul>
                            <p className="mt-4">We reserve the right to remove any Content and/or terminate user accounts for any conduct that we deem inappropriate or harmful, without prior notice.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Info className="h-6 w-6 text-[#01ae79]" />}
                            title="4. Use of the Platform"
                        >
                            <p>UpDrafted provides a platform for athletes to showcase their talents and for college programs to find potential recruits. We do not guarantee any specific outcomes, such as scholarships, team placements, or recruitment offers. We are not a party to any agreements entered into between athletes and college programs. Athletes and college programs are responsible for their own due diligence and compliance with all applicable rules and regulations (e.g., NCAA, NJCAA eligibility).</p>
                            <p className="mt-4">Our platform offers a free tier of service, with optional premium features available for a subscription fee. Details of premium features and pricing will be clearly presented within the Service.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Shield className="h-6 w-6 text-[#01ae79]" />}
                            title="5. Intellectual Property"
                        >
                            <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of UpDrafted and its licensors. You grant UpDrafted a non-exclusive, worldwide, royalty-free, sublicensable, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the Content you post to the Service solely for the purposes of operating and providing the Service.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<AlertTriangle className="h-6 w-6 text-[#01ae79]" />}
                            title="6. Disclaimers and Limitation of Liability"
                        >
                            <p>THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. UPDRAFTED EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                            <p className="mt-4">UPDRAFTED WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Scale className="h-6 w-6 text-[#01ae79]" />}
                            title="7. Termination"
                        >
                            <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Info className="h-6 w-6 text-[#01ae79]" />}
                            title="8. Changes to Terms"
                        >
                            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Mail className="h-6 w-6 text-[#01ae79]" />}
                            title="9. Contact Us"
                        >
                            <p>If you have any questions about these Terms, please contact us at <a href="mailto:potirnichecarmine@gmail.com" className="text-[#01ae79] hover:underline font-medium">potirnichecarmine@gmail.com</a>.</p>
                        </TermsSection>

                        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
                            <CardContent className="p-6">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Legal Disclaimer:</strong> Please be aware that this Terms of Service is a provisional document and has not yet been reviewed or approved by legal counsel. It is provided for informational purposes only and is subject to revision. It does not constitute legal advice and should not be relied upon as such.
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
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Now that you&apos;ve reviewed our terms, join UpDrafted and start making connections.
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

interface TermsSectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    isHighlighted?: boolean;
}

const TermsSection: React.FC<TermsSectionProps> = ({ icon, title, children, isHighlighted = false }) => (
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