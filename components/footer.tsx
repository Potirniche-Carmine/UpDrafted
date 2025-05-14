"use client"

import * as React from 'react';
import { Moon, Sun, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Image from 'next/image';

export function Footer() {
  const { setTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: "/about", label: "About Us" },
    { href: "/for-athletes", label: "For Athletes" },
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
    <footer className="w-full border-t border-border/60 bg-background/90">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-8 pb-4 md:pt-12 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="UpDrafted Logo" width={150} height={40} className="h-auto w-[120px] sm:w-[150px]" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting athletes and college programs for a brighter future in college sports.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-3">Platform</h5>
            <ul className="space-y-2">
              {footerLinks.slice(0, 3).map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-3">Company</h5>
            <ul className="space-y-2">
              {footerLinks.slice(3).map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-foreground mb-3">Connect & Customize</h5>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map(social => (
                <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors" title={social.label}>
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
             <div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-auto md:w-auto justify-start text-muted-foreground">
                        <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                        <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                        Toggle Theme
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center border-t border-border/60 pt-4">
          <p className="text-sm text-muted-foreground dark:muted-foreground-dark text-center md:text-left">
            &copy; {currentYear} UpDrafted. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}