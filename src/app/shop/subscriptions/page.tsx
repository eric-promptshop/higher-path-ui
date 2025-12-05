"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Header } from "@/components/header"
import {
  useChefsChoiceStore,
  type ChefChoiceSubscription,
} from "@/lib/chefs-choice-store"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/alert-dialog"
import {
  ChefHat,
  CalendarDays,
  MoreHorizontal,
  Pause,
  Play,
  XCircle,
  ArrowRight,
  Package,
  Clock,
} from "lucide-react"

const frequencyLabels: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  "one-time": "One-time",
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    getSubscriptionsByCustomer,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    getTierById,
    getCurrentTemplateForTier,
  } = useChefsChoiceStore()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/shop/subscriptions")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const subscriptions = getSubscriptionsByCustomer(user.id)
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active")
  const pausedSubscriptions = subscriptions.filter((s) => s.status === "paused")
  const cancelledSubscriptions = subscriptions.filter(
    (s) => s.status === "cancelled"
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const renderSubscriptionCard = (subscription: ChefChoiceSubscription) => {
    const tier = getTierById(subscription.tierId)
    const template = tier ? getCurrentTemplateForTier(tier.id) : null

    return (
      <Card
        key={subscription.id}
        className={
          subscription.status === "cancelled" ? "opacity-60" : undefined
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{subscription.tierLabel}</h3>
                <p className="text-sm text-muted-foreground">
                  {frequencyLabels[subscription.frequency]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={statusColors[subscription.status]}
              >
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </Badge>
              {subscription.status !== "cancelled" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {subscription.status === "active" ? (
                      <DropdownMenuItem
                        onClick={() => pauseSubscription(subscription.id)}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Subscription
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => resumeSubscription(subscription.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume Subscription
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel Subscription?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel your{" "}
                            {subscription.tierLabel} subscription? You can
                            always start a new subscription later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelSubscription(subscription.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Cancel Subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Next delivery info */}
          {subscription.status === "active" && subscription.nextDeliveryDate && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg mb-4">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Next Delivery</p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(subscription.nextDeliveryDate),
                    "EEEE, MMMM d, yyyy"
                  )}
                </p>
              </div>
            </div>
          )}

          {subscription.status === "paused" && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Subscription Paused
                </p>
                <p className="text-sm text-yellow-700">
                  Resume anytime to continue deliveries
                </p>
              </div>
            </div>
          )}

          {/* Template info */}
          {template && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Current Selection
              </p>
              <p className="text-sm">{template.name}</p>
              <div className="flex flex-wrap gap-1">
                {template.items.slice(0, 3).map((item, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {item.productName}
                  </Badge>
                ))}
                {template.items.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.items.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          {subscription.tierType === "dollar" && (
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Per delivery
              </span>
              <span className="font-semibold">
                {formatCurrency(subscription.tierValue)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} searchQuery="" />

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your Chef&apos;s Choice subscriptions
            </p>
          </div>
          <Link href="/shop/chefs-choice">
            <Button className="gap-2">
              <ChefHat className="w-4 h-4" />
              New Subscription
            </Button>
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium mb-2">No Subscriptions Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start a Chef&apos;s Choice subscription and let us curate the
                perfect selection for you.
              </p>
              <Link href="/shop/chefs-choice">
                <Button className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-medium text-muted-foreground">
                  Active ({activeSubscriptions.length})
                </h2>
                <div className="space-y-4">
                  {activeSubscriptions.map(renderSubscriptionCard)}
                </div>
              </div>
            )}

            {/* Paused Subscriptions */}
            {pausedSubscriptions.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-medium text-muted-foreground">
                  Paused ({pausedSubscriptions.length})
                </h2>
                <div className="space-y-4">
                  {pausedSubscriptions.map(renderSubscriptionCard)}
                </div>
              </div>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-medium text-muted-foreground">
                  Cancelled ({cancelledSubscriptions.length})
                </h2>
                <div className="space-y-4">
                  {cancelledSubscriptions.map(renderSubscriptionCard)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to Shop */}
        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button variant="ghost">Back to Shop</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
