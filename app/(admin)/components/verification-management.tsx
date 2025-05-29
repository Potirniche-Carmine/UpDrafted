"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Link,
  User,
  Calendar,
  Download,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MockVerificationFile {
  id: number;
  fileName?: string;
  fileType: string;
  description: string;
  linkUrl?: string;
}

interface MockVerificationRequest {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  organizationName: string;
  sportCoaching: string;
  additionalInfo?: string;
  files: MockVerificationFile[];
  approvalNotes?: string;
}

// Mock data for verification requests
const mockVerificationRequests: MockVerificationRequest[] = [
  {
    id: 1,
    userId: "user_123",
    fullName: "John Smith",
    email: "john.smith@email.com",
    role: "coach",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    organizationName: "Metro High School",
    sportCoaching: "Football",
    additionalInfo: "I am the head coach for varsity football at Metro High School. I have been coaching for 8 years and am looking to connect with talented athletes for our program.",
    files: [
      {
        id: 1,
        fileName: "school_roster_2024.pdf",
        fileType: "pdf",
        description: "Official school coaching roster showing my position"
      },
      {
        id: 2,
        fileName: "coaching_certificate.jpg",
        fileType: "image",
        description: "My coaching certification"
      },
      {
        id: 3,
        fileName: "School Athletics Staff Directory",
        fileType: "link",
        description: "School athletics staff directory",
        linkUrl: "https://metrohigh.edu/athletics/staff"
      }
    ]
  },
  {
    id: 2,
    userId: "user_456",
    fullName: "Sarah Johnson",
    email: "s.johnson@university.edu",
    role: "recruiter",
    status: "under_review",
    submittedAt: "2024-01-14T14:22:00Z",
    reviewedAt: "2024-01-15T09:15:00Z",
    organizationName: "State University",
    sportCoaching: "Basketball",
    additionalInfo: "I work as a recruiting coordinator for the women's basketball program at State University. I handle prospect evaluation and initial contact with potential recruits.",
    files: [
      {
        id: 4,
        fileName: "university_id.jpg",
        fileType: "image",
        description: "University staff ID badge"
      },
      {
        id: 5,
        fileName: "University Recruiting Staff Page",
        fileType: "link",
        description: "University recruiting staff page",
        linkUrl: "https://stateuniversity.edu/athletics/staff/recruiting"
      }
    ]
  },
  {
    id: 3,
    userId: "user_789",
    fullName: "Mike Davis",
    email: "mike.davis@academy.org",
    role: "coach",
    status: "approved",
    submittedAt: "2024-01-10T16:45:00Z",
    reviewedAt: "2024-01-12T11:30:00Z",
    organizationName: "Elite Sports Academy",
    sportCoaching: "Soccer",
    files: [
      {
        id: 6,
        fileName: "employment_letter.pdf",
        fileType: "pdf",
        description: "Letter of employment from Elite Sports Academy"
      }
    ]
  },
  {
    id: 4,
    userId: "user_101",
    fullName: "Lisa Chen",
    email: "l.chen@highschool.edu",
    role: "coach",
    status: "rejected",
    submittedAt: "2024-01-08T12:15:00Z",
    reviewedAt: "2024-01-09T10:45:00Z",
    rejectionReason: "Submitted documents could not be verified with the institution listed. Please provide additional documentation or an official letter from the organization.",
    organizationName: "Westfield High School",
    sportCoaching: "Tennis",
    files: [
      {
        id: 7,
        fileName: "business_card.jpg",
        fileType: "image",
        description: "Business card"
      }
    ]
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case "under_review":
      return <Badge variant="outline" className="text-blue-600 border-blue-300"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
    case "approved":
      return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    case "rejected":
      return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-4 h-4 text-red-600" />;
    case "image":
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    case "link":
      return <Link className="w-4 h-4 text-green-600" />;
    default:
      return <FileText className="w-4 h-4" />;
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

interface VerificationDetailDialogProps {
  request: MockVerificationRequest;
  onApprove: (id: number, notes?: string) => void;
  onReject: (id: number, reason: string) => void;
  onStartReview: (id: number) => void;
}

function VerificationDetailDialog({ request, onApprove, onReject, onStartReview }: VerificationDetailDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

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
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="break-words">Verification Request #{request.id}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Review the verification request and supporting documentation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium text-sm">{request.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm break-all">{request.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="capitalize text-sm">{request.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                  <p className="text-sm break-words">{request.organizationName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sport</label>
                  <p className="text-sm">{request.sportCoaching}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <p className="flex items-center gap-2 mt-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(request.submittedAt)}
                </p>
              </div>

              {request.reviewedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Reviewed</label>
                  <p className="flex items-center gap-2 mt-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(request.reviewedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {request.additionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed break-words">{request.additionalInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* Supporting Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {request.files.map((file) => (
                  <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getFileIcon(file.fileType)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm break-words">
                          {file.fileName || `${file.fileType.toUpperCase()} Link`}
                        </p>
                        {file.description && (
                          <p className="text-xs text-muted-foreground break-words">{file.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {file.fileType.toUpperCase()}
                      </Badge>
                      {file.fileType === "link" ? (
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason (if rejected) */}
          {request.status === "rejected" && request.rejectionReason && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-red-600">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-words">{request.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {(request.status === "pending" || request.status === "under_review") && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t">
              {request.status === "pending" && (
                <Button onClick={() => onStartReview(request.id)} variant="outline" className="w-full sm:w-auto">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Review
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Verification Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will verify the user&apos;s credentials and grant them verified status.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Textarea
                      placeholder="Add any notes about the verification..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onApprove(request.id, approvalNotes)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve Request
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Verification Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please provide a reason for rejecting this verification request.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium">Rejection Reason *</label>
                    <Textarea
                      placeholder="Explain why this verification request is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onReject(request.id, rejectionReason)}
                      disabled={!rejectionReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject Request
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

export function VerificationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState(mockVerificationRequests);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleApprove = (id: number, notes?: string) => {
    setRequests(prev => prev.map(request => 
      request.id === id 
        ? { ...request, status: "approved", reviewedAt: new Date().toISOString(), approvalNotes: notes } as MockVerificationRequest
        : request
    ));
  };

  const handleReject = (id: number, reason: string) => {
    setRequests(prev => prev.map(request => 
      request.id === id 
        ? { ...request, status: "rejected", rejectionReason: reason, reviewedAt: new Date().toISOString() } as MockVerificationRequest
        : request
    ));
  };

  const handleStartReview = (id: number) => {
    setRequests(prev => prev.map(request => 
      request.id === id 
        ? { ...request, status: "under_review", reviewedAt: new Date().toISOString() } as MockVerificationRequest
        : request
    ));
  };

  const statusCounts = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    under_review: requests.filter(r => r.status === "under_review").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold">{statusCounts.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Requests</div>
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
            <div className="text-lg sm:text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Rejected</div>
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
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm w-full"
                />
              </div>
            </div>
            <div className="w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verification Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedRequests.map((request) => (
              <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarFallback>
                      {request.fullName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 className="font-medium text-sm sm:text-base truncate">{request.fullName}</h3>
                      <div className="flex-shrink-0">{getStatusBadge(request.status)}</div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{request.email}</p>
                    <p className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">Seeking verification as:</span>{" "}
                      <span className="capitalize font-medium">{request.role}</span> at <span className="truncate">{request.organizationName}</span>
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">Submitted</span> {formatDate(request.submittedAt)}
                      </span>
                      <span>{request.files.length} document{request.files.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <VerificationDetailDialog
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onStartReview={handleStartReview}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {paginatedRequests.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No verification requests found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No verification requests have been submitted yet"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredRequests.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
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