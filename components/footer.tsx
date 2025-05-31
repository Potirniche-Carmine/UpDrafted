"use client"

import * as React from 'react';
import { Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    { href: "https://linkedin.com", label: "LinkedIn", icon: <Linkedin className="h-5 w-5" /> },
    { href: "https://twitter.com", label: "Twitter", icon: <Twitter className="h-5 w-5" /> },
    { href: "https://facebook.com", label: "Facebook", icon: <Facebook className="h-5 w-5" /> },
    { href: "https://instagram.com", label: "Instagram", icon: <Instagram className="h-5 w-5" /> },
  ];

  return (
    <footer className="w-full bg-gradient-to-br from-slate-50/50 to-emerald-50/30 dark:from-slate-950/50 dark:to-emerald-950/20 border-t border-border/40">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Brand section - spans 2 columns on desktop */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/logo.png" 
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
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/60 dark:bg-gray-800/60 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all duration-200 shadow-sm hover:shadow-md border border-border/50"
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
                    className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 text-sm font-medium"
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
                    className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 text-sm font-medium"
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