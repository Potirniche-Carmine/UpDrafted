"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Mail, Clock, ArrowRight, Bug, Lightbulb, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create form data for Web3Forms
      const web3FormData = new FormData();
      web3FormData.append('access_key', 'dc5a04d2-497b-4ea0-affb-1dda0edcde7e');
      web3FormData.append('name', formData.name);
      web3FormData.append('email', formData.email);
      web3FormData.append('subject', `[${formData.category}] ${formData.subject}`);
      web3FormData.append('message', `
Category: ${formData.category}
Subject: ${formData.subject}

Message:
${formData.message}

---
Submitted via UpDrafted Contact Form
Timestamp: ${new Date().toISOString()}
      `);
      
      // Add additional fields for better organization
      web3FormData.append('category', formData.category);
      web3FormData.append('from_name', formData.name);
      web3FormData.append('redirect', 'false'); // Prevent redirect, handle in JS
      
      // Submit to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: web3FormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success state
        setIsSubmitted(true);
        
        // Reset form after delay
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            subject: "",
            category: "",
            message: "",
          });
          setIsSubmitted(false);
        }, 5000);
      } else {
        console.error("Web3Forms submission error:", result);
        // Fall back to mailto
        const subject = encodeURIComponent(`[${formData.category}] ${formData.subject}`);
        const body = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n` +
          `Category: ${formData.category}\n\n` +
          `Message:\n${formData.message}\n\n` +
          `---\n` +
          `Submitted via UpDrafted Contact Form`
        );
        window.open(`mailto:support@updrafted.us?subject=${subject}&body=${body}`, '_blank');
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Fall back to mailto on error
      const subject = encodeURIComponent(`[${formData.category}] ${formData.subject}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Category: ${formData.category}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\n` +
        `Submitted via UpDrafted Contact Form`
      );
      window.open(`mailto:support@updrafted.us?subject=${subject}&body=${body}`, '_blank');
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.category && formData.message;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="outline" className="w-fit bg-[#01ae79]/5 dark:bg-[#01ae79]/10 text-[#01ae79] border-[#01ae79]/30 mx-auto">
              <Mail className="w-4 h-4 mr-2" />
              Contact & Support
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
              Get in{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#01ae79] to-[#01ae79]/80">
                Touch
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Need help, found a bug, or have a great idea for a new feature? We&apos;re here to help make your UpDrafted experience better.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                {isSubmitted ? (
                  <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        Your message has been sent successfully! We&apos;ll get back to you at {formData.email} within our standard response times. If you need immediate assistance, you can also email us directly at{" "}
                        <a href="mailto:support@updrafted.us" className="font-medium underline">
                          support@updrafted.us
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Your full name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={formData.category} onValueChange={handleCategoryChange} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bug-report">🐛 Bug Report</SelectItem>
                              <SelectItem value="feature-request">💡 Feature Request</SelectItem>
                              <SelectItem value="general-support">❓ General Support</SelectItem>
                              <SelectItem value="account-issue">👤 Account Issue</SelectItem>
                              <SelectItem value="technical-issue">🔧 Technical Issue</SelectItem>
                              <SelectItem value="feedback">💬 Feedback</SelectItem>
                              <SelectItem value="partnership">🤝 Partnership Inquiry</SelectItem>
                              <SelectItem value="other">📋 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Brief description of your message"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder={getPlaceholderText(formData.category)}
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={6}
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                          disabled={!isFormValid || isSubmitting}
                        >
                          {isSubmitting ? (
                            "Submitting..."
                          ) : (
                            <>
                              Send Message
                              <Send className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>

                        <p className="text-sm text-muted-foreground text-center">
                          * Required fields
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Contact Information
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the best way to reach us based on your needs.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email Support */}
                  <Card className="border border-[#01ae79]/20 dark:border-[#01ae79]/30 hover:border-[#01ae79]/30 dark:hover:border-[#01ae79]/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full flex items-center justify-center">
                          <Mail className="h-6 w-6 text-[#01ae79]" />
                        </div>
                        <h3 className="text-xl font-semibold">Email Support</h3>
                        <p className="text-muted-foreground">
                          Send us a detailed message for any questions, issues, or suggestions.
                        </p>
                        <div className="space-y-2">
                          <p className="font-medium text-[#01ae79]">
                            <a href="mailto:support@updrafted.us" className="hover:underline">
                              support@updrafted.us
                            </a>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Response time: 12-48 hours
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Support Categories */}
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-200">Bug Reports</p>
                            <p className="text-sm text-red-700 dark:text-red-300">Priority response</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-200">Feature Requests</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">We&apos;d love to hear your ideas</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">General Support</p>
                            <p className="text-sm text-green-700 dark:text-green-300">Questions and assistance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Response Times */}
                <Card className="bg-[#01ae79]/5 dark:bg-[#01ae79]/10 border-[#01ae79]/20 dark:border-[#01ae79]/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#01ae79]/20 dark:bg-[#01ae79]/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-[#01ae79]" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Expected Response Times</h3>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <p className="font-medium text-[#01ae79]">Bug Reports</p>
                            <p className="text-sm text-muted-foreground">Within 12 hours</p>
                          </div>
                          <div>
                            <p className="font-medium text-[#01ae79]">Technical Issues</p>
                            <p className="text-sm text-muted-foreground">Within 24 hours</p>
                          </div>
                          <div>
                            <p className="font-medium text-[#01ae79]">General Inquiries</p>
                            <p className="text-sm text-muted-foreground">24-48 hours</p>
                          </div>
                          <div>
                            <p className="font-medium text-[#01ae79]">Feature Requests</p>
                            <p className="text-sm text-muted-foreground">Within 48 hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              Join thousands of athletes and coaches making connections on UpDrafted.
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

function getPlaceholderText(category: string): string {
  switch (category) {
    case "bug-report":
      return "Please describe the bug you encountered:\n\n1. What were you trying to do?\n2. What happened instead?\n3. What browser/device are you using?\n4. Steps to reproduce the issue (if known)";
    case "feature-request":
      return "Tell us about your feature idea:\n\n1. What feature would you like to see?\n2. How would it help you or other users?\n3. Any specific details about how it should work?";
    case "general-support":
      return "How can we help you today? Please provide as much detail as possible about your question or issue.";
    case "account-issue":
      return "Please describe the issue with your account:\n\n1. What specific problem are you experiencing?\n2. When did this issue start?\n3. Have you tried any troubleshooting steps?";
    case "technical-issue":
      return "Please describe the technical issue:\n\n1. What specific problem are you experiencing?\n2. What browser/device are you using?\n3. Any error messages you've seen?";
    case "feedback":
      return "We'd love to hear your feedback! Please share your thoughts, suggestions, or experiences with UpDrafted.";
    case "partnership":
      return "Tell us about your partnership inquiry:\n\n1. What type of partnership are you interested in?\n2. About your organization\n3. How can we work together?";
    default:
      return "Please provide details about your inquiry. The more information you can share, the better we can assist you.";
  }
}