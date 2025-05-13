"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserX, MessageCircle, Search, Check, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import Image from 'next/image'; // Using next/image for placeholders

// Placeholder data types
interface Connection {
  id: string;
  name: string;
  role: string;
  avatarUrl: string; // URL to a placeholder image
  mutualConnections?: number;
  connectedSince?: string;
}

interface PendingRequest extends Connection {
  direction: 'incoming' | 'outgoing';
}

// Placeholder data
const placeholderConnections: Connection[] = [
  { id: '1', name: 'Coach Sarah Miller', role: 'Head Coach - Stanford University Volleyball', avatarUrl: 'https://placehold.co/100x100/E0E0E0/B0B0B0?text=SM', mutualConnections: 5, connectedSince: '2 weeks ago' },
  { id: '2', name: 'Alex Johnson (AJ)', role: 'Athlete - Football QB, Class of 2026', avatarUrl: 'https://placehold.co/100x100/D1C4E9/7E57C2?text=AJ', mutualConnections: 2, connectedSince: '1 month ago' },
  { id: '3', name: 'Dr. Emily Carter', role: 'Athletic Director - Duke University', avatarUrl: 'https://placehold.co/100x100/C8E6C9/66BB6A?text=EC', connectedSince: '3 months ago' },
  { id: '4', name: 'Michael Chen', role: 'Recruiter - UCLA Basketball', avatarUrl: 'https://placehold.co/100x100/BBDEFB/42A5F5?text=MC', mutualConnections: 8, connectedSince: '5 days ago' },
];

const placeholderPendingRequests: PendingRequest[] = [
  { id: 'p1', name: 'Maria Rodriguez', role: 'Athlete - Soccer Midfielder, Class of 2027', avatarUrl: 'https://placehold.co/100x100/FFE0B2/FFB74D?text=MR', direction: 'incoming' },
  { id: 'p2', name: 'Coach Ben Carter', role: 'Assistant Coach - University of Texas Football', avatarUrl: 'https://placehold.co/100x100/F8BBD0/F06292?text=BC', direction: 'outgoing' },
];

const placeholderBlockedUsers: Connection[] = [
  { id: 'b1', name: 'User One', role: 'Blocked User', avatarUrl: 'https://placehold.co/100x100/CFD8DC/90A4AE?text=U1' },
];

type Tab = 'connections' | 'pending' | 'blocked';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('connections');
  const [searchTerm, setSearchTerm] = useState('');
  // Add more state for filters if needed

  const filteredConnections = useMemo(() => {
    return placeholderConnections.filter(conn => 
      conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredPending = useMemo(() => {
    return placeholderPendingRequests.filter(req => 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  
  const filteredBlocked = useMemo(() => {
    return placeholderBlockedUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);


  const renderConnections = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredConnections.length > 0 ? filteredConnections.map(conn => (
        <div key={conn.id} className="bg-card border border-border/50 rounded-lg shadow-lg p-5 flex flex-col text-center items-center hover:shadow-primary/20 transition-shadow duration-300">
          <Image src={conn.avatarUrl} alt={conn.name} width={80} height={80} className="rounded-full mb-3 object-cover" />
          <h3 className="text-lg font-semibold text-foreground">{conn.name}</h3>
          <p className="text-xs text-muted-foreground mb-1">{conn.role}</p>
          {conn.mutualConnections && <p className="text-xs text-primary/80 mb-1">{conn.mutualConnections} mutual connections</p>}
          <p className="text-xs text-muted-foreground/70 mb-4">Connected {conn.connectedSince}</p>
          <div className="flex space-x-2 mt-auto w-full">
            <Button variant="outline" size="sm" className="flex-1 group">
              <MessageCircle className="h-4 w-4 mr-1.5 group-hover:text-primary transition-colors" /> Message
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive px-2">
              <UserX className="h-4 w-4" />
               <span className="sr-only">Remove Connection</span>
            </Button>
          </div>
           <Link href={`/profile/${conn.id}`} className="w-full mt-2">
             <Button variant="default" size="sm" className="w-full bg-primary/90 hover:bg-primary text-primary-foreground">View Profile</Button>
           </Link>
        </div>
      )) : <p className="col-span-full text-center text-muted-foreground">No connections found matching your search.</p>}
    </div>
  );

  const renderPendingRequests = () => (
    <div className="space-y-4">
      {filteredPending.length > 0 ? filteredPending.map(req => (
        <div key={req.id} className="bg-card border border-border/50 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src={req.avatarUrl} alt={req.name} width={40} height={40} className="rounded-full object-cover" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{req.name}</h3>
              <p className="text-xs text-muted-foreground">{req.role}</p>
            </div>
          </div>
          {req.direction === 'incoming' ? (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700">
                <Check className="h-4 w-4 mr-1.5"/> Accept
              </Button>
              <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-500/10 hover:text-red-700">
                <X className="h-4 w-4 mr-1.5"/> Decline
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm">Cancel Request</Button>
          )}
        </div>
      )) : <p className="text-center text-muted-foreground">No pending requests found.</p>}
    </div>
  );
  
  const renderBlockedUsers = () => (
    <div className="space-y-4">
      {filteredBlocked.length > 0 ? filteredBlocked.map(user => (
        <div key={user.id} className="bg-card border border-border/50 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="rounded-full object-cover" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-orange-600 border-orange-500 hover:bg-orange-500/10 hover:text-orange-700">
            <UserPlus className="h-4 w-4 mr-1.5"/> Unblock
          </Button>
        </div>
      )) : <p className="text-center text-muted-foreground">No blocked users found.</p>}
    </div>
  );


  return (
    <div className="flex flex-col items-center min-h-screen">
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-secondary/10 dark:from-black dark:to-secondary/5">
        <div className="container px-4 md:px-6 text-center">
          <Users className="mx-auto h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 py-2">
            My Connections
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-muted-foreground md:text-xl">
            Manage your professional network, pending requests, and blocked users.
          </p>
        </div>
      </section>

      <section className="w-full py-8 md:py-12 flex-grow">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-border/50 bg-background/70 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              {/* <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" /> Filters <ChevronDown className="h-4 w-4 ml-1" />
              </Button> */}
            </div>
            <div className="border-b border-border/60">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {(['connections', 'pending', 'blocked'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                      ${activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                  >
                    {tab} ({tab === 'connections' ? filteredConnections.length : tab === 'pending' ? filteredPending.length : filteredBlocked.length})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {activeTab === 'connections' && renderConnections()}
          {activeTab === 'pending' && renderPendingRequests()}
          {activeTab === 'blocked' && renderBlockedUsers()}
        </div>
      </section>
    </div>
  );
}
