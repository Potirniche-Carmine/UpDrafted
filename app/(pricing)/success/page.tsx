import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { AuthWrapper } from '@/components/auth-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Crown, ArrowRight, Search, MessageSquare, Eye, BarChart3, Users } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/pricing')
  }

  let session
  let isSubscription = false

  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent', 'subscription']
    })

    if (session.mode === 'subscription') {
      isSubscription = true
    }
  } catch (error) {
    console.error('Error retrieving session:', error)
    redirect('/pricing')
  }

  if (session.status === 'open') {
    redirect('/pricing')
  }

  const customerEmail = session.customer_details?.email

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#01ae79]/5 dark:to-[#01ae79]/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border border-border/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Premium!</h1>
              <p className="text-muted-foreground text-lg">
                Your {isSubscription ? 'subscription' : 'purchase'} was successful. Time to unlock your recruiting potential!
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20 rounded-lg p-6 mb-6 border border-[#01ae79]/20">
              <div className="flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-[#01ae79] mr-2" />
                <span className="font-semibold text-[#01ae79]">Premium Access Activated</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {customerEmail && (
                  <>A confirmation email has been sent to <strong>{customerEmail}</strong>. </>
                )}
                Your premium features are ready to use immediately!
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-[#01ae79] mr-1" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-[#01ae79] mr-1" />
                  <span>Unlimited Connections</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Premium Features Are Now Active!</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-left p-4 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-[#01ae79] mr-2" />
                    <h3 className="font-medium">Unlimited Connections</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect with unlimited athletes, coaches, or recruiters - no monthly limits
                  </p>
                </div>
                <div className="text-left p-4 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center mb-2">
                    <Search className="h-5 w-5 text-[#01ae79] mr-2" />
                    <h3 className="font-medium">Advanced Search Filters</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Find your perfect match with detailed filtering by sport, location, and more
                  </p>
                </div>
                <div className="text-left p-4 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-[#01ae79] mr-2" />
                    <h3 className="font-medium">Read Receipts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Know when your messages are seen and get better response rates
                  </p>
                </div>
                <div className="text-left p-4 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-[#01ae79] mr-2" />
                    <h3 className="font-medium">Profile Analytics</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    See who&apos;s viewing your profile and track your recruiting success
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/discover" className="block">
                <Button className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                  Start Discovering
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full border-[#01ae79]/30 hover:bg-[#01ae79]/5">
                  View Dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team at{' '}
                <Link href="mailto:support@updrafted.us" className="text-[#01ae79] hover:underline">
                  support@updrafted.us
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  )
}