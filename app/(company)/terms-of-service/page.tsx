"use client";

import { Scale, Info, UserCheck, AlertTriangle, FileText, MapPin, Mail, ShieldCheck } from 'lucide-react';

export default function TermsOfServicePage() {
    const lastUpdated = "May 13, 2025"; // Update this date as needed
    const effectiveDate = "May 13, 2025"; // Update this date as needed

    return (
        <div className="flex flex-col items-center">
            <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-black dark:to-secondary/15">
                <div className="container px-4 md:px-6 text-center">
                    <Scale className="mx-auto h-16 w-16 text-primary mb-6" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
                        Terms of Service
                    </h1>
                    <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                        Please read these Terms of Service carefully before using the UpDrafted platform.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Effective Date: {effectiveDate} | Last Updated: {lastUpdated}</p>
                </div>
            </section>

            <section className="w-full py-12 md:py-20 lg:py-28">
                <div className="container px-4 md:px-6">
                    <div className="mx-auto max-w-3xl space-y-8 text-muted-foreground md:text-lg leading-relaxed">

                        <TermsSection
                            icon={<Info className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="1. Acceptance of Terms"
                        >
                            <p>By accessing or using the UpDrafted website, mobile applications, and related services (collectively, the &quot;Service&quot;), provided by UpDrafted (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not use the Service. These Terms apply to all users of the Service, including athletes, parents/guardians, coaches, recruiters, scouts, and college program representatives.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<UserCheck className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="2. User Accounts & Eligibility"
                        >
                            <p>To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account. You must be at least 13 years old to use the Service. If you are under 18, you represent that you have your parent or guardian&apos;s permission to use the Service and that they have read and agreed to these Terms on your behalf.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<FileText className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="3. User Conduct and Content"
                        >
                            <p>You are solely responsible for all content (information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials - &quot;Content&quot;) that you upload, post, publish, display, or otherwise transmit via the Service. You agree not to use the Service to:</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>Upload any Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another&apos;s privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
                                <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                                <li>Upload any Content that you do not have a right to transmit under any law or under contractual or fiduciary relationships.</li>
                                <li>Violate any applicable local, state, national, or international law, or any regulations having the force of law, including NCAA and NJCAA rules and regulations.</li>
                            </ul>
                            <p>We reserve the right to remove any Content and/or terminate user accounts for any conduct that we deem inappropriate or harmful, without prior notice.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Info className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="4. Use of the Platform"
                        >
                            <p>UpDrafted provides a platform for athletes to showcase their talents and for college programs to find potential recruits. We do not guarantee any specific outcomes, such as scholarships, team placements, or recruitment offers. We are not a party to any agreements entered into between athletes and college programs. Athletes and college programs are responsible for their own due diligence and compliance with all applicable rules and regulations (e.g., NCAA, NJCAA eligibility).</p>
                            <p>Our platform offers a free tier of service, with optional premium features available for a subscription fee. Details of premium features and pricing will be clearly presented within the Service.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<ShieldCheck className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="5. Intellectual Property"
                        >
                            <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of UpDrafted and its licensors. You grant UpDrafted a non-exclusive, worldwide, royalty-free, sublicensable, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the Content you post to the Service solely for the purposes of operating and providing the Service.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<AlertTriangle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="6. Disclaimers and Limitation of Liability"
                        >
                            <p>THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. UPDRAFTED EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                            <p>UPDRAFTED WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Scale className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="7. Termination"
                        >
                            <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<MapPin className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="8. Governing Law"
                        >
                            <p>These Terms shall be governed and construed in accordance with the laws of the State of Nevada, United States, without regard to its conflict of law provisions.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Info className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="9. Changes to Terms"
                        >
                            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                        </TermsSection>

                        <TermsSection
                            icon={<Mail className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="10. Contact Us"
                        >
                            <p>If you have any questions about these Terms, please contact us at <a href="mailto:potirnichecarmine@gmail.com" className="text-primary hover:underline">potirnichecarmine@gmail.com</a>.</p>
                        </TermsSection>

                        <p className="text-sm italic mt-8 text-amber-700 dark:text-amber-500">
                            <strong>Disclaimer:</strong> Please be aware that this Terms of Service is a provisional document and has not yet been reviewed or approved by legal counsel. It is provided for informational purposes only and is subject to revision. It does not constitute legal advice and should not be relied upon as such.
                        </p>
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
}

const TermsSection: React.FC<TermsSectionProps> = ({ icon, title, children }) => (
    <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground flex items-start">
            {icon}
            {title}
        </h2>
        <div className="pl-9 space-y-3">{children}</div>
    </div>
);