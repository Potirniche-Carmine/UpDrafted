"use client"

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Social Media Icons as Components
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: "/about", label: "About Us" },
    { href: "/for-athletes", label: "For Athletes" },
    { href: "/for-coaches", label: "For Coaches" },
    { href: "/for-recruiters", label: "For Recruiters" },
    { href: "/contact", label: "Contact Us" },
    { href: "/terms-of-service", label: "Terms of Service" },
    { href: "/privacy-policy", label: "Privacy Policy" },
  ];
  const socialLinks = [
    { href: "https://x.com/UpDraftedapp", label: "X", icon: <TwitterXIcon /> },
    { href: "https://instagram.com", label: "Instagram", icon: <InstagramIcon /> },
    { href: "https://facebook.com", label: "Facebook", icon: <FacebookIcon /> },
  ];

  return (
    <footer className="w-full bg-gradient-to-br from-slate-50/50 to-[#01ae79]/5 dark:from-slate-950/50 dark:to-[#01ae79]/10 border-t border-border/40">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Brand section - spans 2 columns on desktop */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/updrafted-logo.png" 
                alt="UpDrafted Logo" 
                width={150} 
                height={40} 
                className="h-auto w-[140px] sm:w-[160px]" 
              />
            </Link>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Connecting athletes and college programs for a brighter future in college sports. Join the premier platform where talent meets opportunity.
            </p>
            
            {/* Social links moved to brand section */}
            <div className="pt-4">
              <h5 className="font-semibold text-foreground mb-4">Connect With Us</h5>
              <div className="flex space-x-3">
                {socialLinks.map(social => (
                  <Link 
                    key={social.label} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/60 dark:bg-gray-800/60 text-muted-foreground hover:text-[#01ae79] dark:hover:text-[#01ae79] hover:bg-[#01ae79]/5 dark:hover:bg-[#01ae79]/10 transition-all duration-200 shadow-sm hover:shadow-md border border-border/50"
                    title={social.label}
                  >
                    {social.icon}
                    <span className="sr-only">{social.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Platform links */}
          <div className="space-y-4">
            <h5 className="font-semibold text-foreground text-lg">Platform</h5>
            <ul className="space-y-3">
              {footerLinks.slice(0, 4).map(link => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-[#01ae79] transition-colors duration-200 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h5 className="font-semibold text-foreground text-lg">Company</h5>
            <ul className="space-y-3">
              {footerLinks.slice(4).map(link => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-[#01ae79] transition-colors duration-200 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright section with better spacing and positioning */}
        <div className="pt-6 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              &copy; {currentYear} UpDrafted. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Your Talent. Their Radar. Our Platform.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}