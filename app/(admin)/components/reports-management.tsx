"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Flag,
  ShieldAlert,
  Users,
  MessageSquare,
  AlertTriangle,
  UserX,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MockReport {
  id: number;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserId: string;
  reportedName: string;
  reportedEmail: string;
  reportedType: string;
  reportReason: string;
  reportReasonLabel: string;
  additionalDetails: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  moderatorNotes?: string;
  actionTaken?: string;
}

// Mock data for reports
const mockReports: MockReport[] = [
  {
    id: 1,
    reporterId: "user_reporter_1",
    reporterName: "Alex Johnson",
    reporterEmail: "alex.johnson@email.com",
    reportedUserId: "user_reported_1",
    reportedName: "Mike Wilson",
    reportedEmail: "mike.wilson@email.com",
    reportedType: "coach",
    reportReason: "hate",
    reportReasonLabel: "Hate Speech or Harassment",
    additionalDetails: "This coach sent threatening messages to my child after they declined an offer. The messages contained inappropriate language and intimidating threats about their future in the sport.",
    status: "pending",
    submittedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: 2,
    reporterId: "user_reporter_2",
    reporterName: "Sarah Chen",
    reporterEmail: "sarah.chen@email.com",
    reportedUserId: "user_reported_2",
    reportedName: "David Thompson",
    reportedEmail: "d.thompson@fake-university.com",
    reportedType: "recruiter",
    reportReason: "impersonation",
    reportReasonLabel: "Impersonation",
    additionalDetails: "This person is claiming to be a recruiter for a major university but their email domain doesn't match and when I called the university, they had no record of this person.",
    status: "under_review",
    submittedAt: "2024-01-14T09:15:00Z",
    reviewedAt: "2024-01-15T10:30:00Z",
    moderatorNotes: "Investigating with university athletic department",
  },
  {
    id: 3,
    reporterId: "user_reporter_3",
    reporterName: "Jennifer Davis",
    reporterEmail: "j.davis@email.com",
    reportedUserId: "user_reported_3",
    reportedName: "Tommy Rodriguez",
    reportedEmail: "tommy.r@email.com",
    reportedType: "athlete",
    reportReason: "underage",
    reportReasonLabel: "Underage User",
    additionalDetails: "This athlete's profile states they are in 8th grade and 13 years old, which would make them under the minimum age requirement for the platform.",
    status: "resolved",
    submittedAt: "2024-01-12T16:20:00Z",
    reviewedAt: "2024-01-13T11:45:00Z",
    actionTaken: "User account suspended pending age verification",
  },
  {
    id: 4,
    reporterId: "user_reporter_4",
    reporterName: "Mark Stevens",
    reporterEmail: "mark.stevens@email.com",
    reportedUserId: "user_reported_4",
    reportedName: "Lisa Martinez",
    reportedEmail: "lisa.martinez@email.com",
    reportedType: "coach",
    reportReason: "spam",
    reportReasonLabel: "Spam or Scam",
    additionalDetails: "This coach is sending the exact same message to hundreds of athletes asking for personal information and requesting payment for 'premium recruiting services'.",
    status: "dismissed",
    submittedAt: "2024-01-10T13:10:00Z",
    reviewedAt: "2024-01-11T09:20:00Z",
    actionTaken: "Investigation revealed legitimate recruiting outreach with standardized messaging",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case "under_review":
      return <Badge variant="outline" className="text-blue-600 border-blue-300"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
    case "resolved":
      return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
    case "dismissed":
      return <Badge variant="outline" className="text-gray-600 border-gray-300"><XCircle className="w-3 h-3 mr-1" />Dismissed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getReasonIcon = (reason: string) => {
  switch (reason) {
    case "hate":
      return <ShieldAlert className="w-4 h-4 text-red-600" />;
    case "impersonation":
      return <UserX className="w-4 h-4 text-orange-600" />;
    case "underage":
      return <Users className="w-4 h-4 text-blue-600" />;
    case "inappropriate":
      return <AlertTriangle className="w-4 h-4 text-purple-600" />;
    case "spam":
      return <MessageSquare className="w-4 h-4 text-yellow-600" />;
    case "false_info":
      return <FileText className="w-4 h-4 text-gray-600" />;
    default:
      return <Flag className="w-4 h-4 text-gray-500" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ReportDetailDialogProps {
  report: MockReport;
  onResolve: (id: number, action: string, notes: string) => void;
  onDismiss: (id: number, notes: string) => void;
  onStartReview: (id: number) => void;
}

function ReportDetailDialog({ report, onResolve, onDismiss, onStartReview }: ReportDetailDialogProps) {
  const [actionTaken, setActionTaken] = useState("");
  const [moderatorNotes, setModeratorNotes] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            <span className="break-words">Report #{report.id}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Review the user report and take appropriate action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Report Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Report Reason</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getReasonIcon(report.reportReason)}
                    <span className="font-medium text-sm">{report.reportReasonLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(report.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p className="flex items-center gap-2 mt-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(report.submittedAt)}
                  </p>
                </div>
                {report.reviewedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Reviewed</label>
                    <p className="flex items-center gap-2 mt-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(report.reviewedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Reporter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium text-sm">{report.reporterName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm break-all">{report.reporterEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reported User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                Reported User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium text-sm">{report.reportedName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm break-all">{report.reportedEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <p className="capitalize text-sm">{report.reportedType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Report Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed break-words">{report.additionalDetails}</p>
            </CardContent>
          </Card>

          {/* Moderator Notes */}
          {report.moderatorNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Moderator Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed break-words">{report.moderatorNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Taken */}
          {report.actionTaken && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-green-600">Action Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-words">{report.actionTaken}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {(report.status === "pending" || report.status === "under_review") && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t">
              {report.status === "pending" && (
                <Button onClick={() => onStartReview(report.id)} variant="outline" className="w-full sm:w-auto">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Review
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Resolve Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Document the action taken to resolve this report.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Action Taken *</label>
                      <Textarea
                        placeholder="Describe what action was taken to resolve this report..."
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Additional Notes (Optional)</label>
                      <Textarea
                        placeholder="Add any additional notes about this case..."
                        value={moderatorNotes}
                        onChange={(e) => setModeratorNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onResolve(report.id, actionTaken, moderatorNotes)}
                      disabled={!actionTaken.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Resolve Report
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Dismiss Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please provide a reason for dismissing this report.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium">Reason for Dismissal *</label>
                    <Textarea
                      placeholder="Explain why this report is being dismissed..."
                      value={moderatorNotes}
                      onChange={(e) => setModeratorNotes(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDismiss(report.id, moderatorNotes)}
                      disabled={!moderatorNotes.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Dismiss Report
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReportsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [reports, setReports] = useState(mockReports);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesReason = reasonFilter === "all" || report.reportReason === reasonFilter;
    return matchesSearch && matchesStatus && matchesReason;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, reasonFilter]);

  const handleResolve = (id: number, action: string, notes: string) => {
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, status: "resolved", actionTaken: action, moderatorNotes: notes, reviewedAt: new Date().toISOString() } as MockReport
        : report
    ));
  };

  const handleDismiss = (id: number, notes: string) => {
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, status: "dismissed", actionTaken: "Report dismissed", moderatorNotes: notes, reviewedAt: new Date().toISOString() } as MockReport
        : report
    ));
  };

  const handleStartReview = (id: number) => {
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, status: "under_review", reviewedAt: new Date().toISOString() } as MockReport
        : report
    ));
  };

  const statusCounts = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    under_review: reports.filter(r => r.status === "under_review").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold">{statusCounts.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{statusCounts.under_review}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-600">{statusCounts.dismissed}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Dismissed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by reporter or reported user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm w-full"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
              <div className="flex-1 min-w-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0">
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Filter by reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="hate">Hate Speech</SelectItem>
                    <SelectItem value="impersonation">Impersonation</SelectItem>
                    <SelectItem value="underage">Underage User</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="spam">Spam/Scam</SelectItem>
                    <SelectItem value="false_info">False Information</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            User Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedReports.map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {getReasonIcon(report.reportReason)}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h3 className="font-medium text-sm sm:text-base break-words leading-tight">{report.reportReasonLabel}</h3>
                        <div className="flex-shrink-0">{getStatusBadge(report.status)}</div>
                      </div>
                      <div className="text-xs sm:text-sm space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-muted-foreground text-xs">Reporter:</span>
                          <span className="font-medium text-xs sm:text-sm break-words">{report.reporterName}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-muted-foreground text-xs">Reported:</span>
                          <span className="font-medium text-xs sm:text-sm break-words">{report.reportedName}</span>
                          <span className="text-muted-foreground text-xs">({report.reportedType})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="hidden sm:inline">Submitted</span> {formatDate(report.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <ReportDetailDialog
                    report={report}
                    onResolve={handleResolve}
                    onDismiss={handleDismiss}
                    onStartReview={handleStartReview}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || reasonFilter !== "all"
                  ? "Try adjusting your search or filter criteria" 
                  : "No reports have been submitted yet"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredReports.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 