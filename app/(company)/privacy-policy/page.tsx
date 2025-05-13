"use client";

import { ShieldCheck, Info, UserCog, DatabaseZap, Cookie, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const lastUpdated = "May 13, 2025"; // Update this date as needed

    return (
        <div className="flex flex-col items-center">
            <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 dark:from-black dark:to-secondary/15">
                <div className="container px-4 md:px-6 text-center">
                    <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-6" />
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
                        Privacy Policy
                    </h1>
                    <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                        Your privacy is important to us. This policy explains how UpDrafted collects, uses, and protects your personal information.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Last Updated: {lastUpdated}</p>
                </div>
            </section>

            <section className="w-full py-12 md:py-20 lg:py-28">
                <div className="container px-4 md:px-6">
                    <div className="mx-auto max-w-3xl space-y-8 text-muted-foreground md:text-lg leading-relaxed">

                        <PrivacySection
                            icon={<Info className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="1. Introduction"
                        >
                            <p>Welcome to UpDrafted (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website (updrafted.com), mobile applications, and/or any related services, sales, marketing, or events (we refer to them collectively in this Privacy Policy as the &quot;Services&quot;).</p>
                            <p>We are a company based in Reno, Nevada, USA. Our goal is to facilitate connections between student-athletes and college athletic programs. This policy outlines how we handle your data in pursuit of this mission.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<DatabaseZap className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="2. Information We Collect"
                        >
                            <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services, or otherwise when you contact us.</p>
                            <p>The personal information we collect may include the following:</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li><strong>Personal Information Provided by You:</strong> Name, email address, phone number, date of birth, physical address, academic information (GPA, test scores, school name), athletic information (sport, position, stats, videos, awards), profile picture, and other similar data.</li>
                                <li><strong>Authentication Data:</strong> For user authentication and account management, we use Clerk (<a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">clerk.com</a>). When you sign up or log in via Clerk, they handle your credentials and provide us with user identifiers and basic profile information as configured in our Clerk integration. Please review Clerk&apos;s privacy policy for more details on their data handling practices.</li>
                                <li><strong>Automatically Collected Information:</strong> IP address, browser type, operating system, access times, pages viewed, and device information when you access our Services.</li>
                            </ul>
                        </PrivacySection>

                        <PrivacySection
                            icon={<UserCog className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="3. How We Use Your Information"
                        >
                            <p>We use personal information collected via our Services for a variety of business purposes described below:</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>To facilitate account creation and logon process (via Clerk).</li>
                                <li>To provide and operate the Services (e.g., display athlete profiles to college programs, allow programs to search for athletes).</li>
                                <li>To manage user accounts and provide customer support.</li>
                                <li>To send administrative information, such as changes to our terms, conditions, and policies.</li>
                                <li>To personalize and improve your experience on our Services.</li>
                                <li>For our business purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns.</li>
                                <li>To send you marketing and promotional communications if you have opted in. You can opt-out of our marketing emails at any time.</li>
                            </ul>
                        </PrivacySection>

                        <PrivacySection
                            icon={<ShieldCheck className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="4. Sharing Your Information"
                        >
                            <p>We may share your information in the following situations:</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li><strong>With College Programs:</strong> If you are an athlete, your profile information will be visible to registered and verified college coaches, recruiters, and scouts using our platform.</li>
                                <li><strong>With Athletes:</strong> If you represent a college program, your program information and contact details (as provided) may be visible to athletes you interact with.</li>
                                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers (like Clerk for authentication, hosting providers, analytics providers) who perform services for us or on our behalf.</li>
                                <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, or legal process.</li>
                                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                            </ul>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Cookie className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="5. Cookies and Tracking Technologies"
                        >
                            <p>We may use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy (if applicable, or briefly mentioned here).</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<ShieldCheck className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="6. Data Security"
                        >
                            <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<UserCog className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="7. Your Privacy Rights"
                        >
                            <p>Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. You can typically manage your profile information by logging into your account. For other requests, please contact us.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Info className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="8. Changes to This Privacy Policy"
                        >
                            <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.</p>
                        </PrivacySection>

                        <PrivacySection
                            icon={<Mail className="h-6 w-6 text-primary mr-3 flex-shrink-0" />}
                            title="9. Contact Us"
                        >
                            <p>If you have questions or comments about this Privacy Policy, you may email us at <a href="mailto:potirnichecamrine@gmail.com" className="text-primary hover:underline">potirnichecarmine@gmail.com</a></p>
                        </PrivacySection>

                        <p className="text-sm italic mt-8 text-amber-700 dark:text-amber-500">
                            <strong>Disclaimer:</strong> Please be aware that this Privacy Policy is a provisional document and has not yet been reviewed or approved by legal counsel. It is provided for informational purposes only and is subject to revision. It does not constitute legal advice and should not be relied upon as such.
                        </p>
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
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ icon, title, children }) => (
    <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground flex items-start">
            {icon}
            {title}
        </h2>
        <div className="pl-9 space-y-3">{children}</div>
    </div>
);