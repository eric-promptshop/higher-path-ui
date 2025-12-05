"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  useChefsChoiceStore,
  type SubscriptionStatus,
} from "@/lib/chefs-choice-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Users,
  Pause,
  Play,
  XCircle,
  Mail,
  Phone,
  CalendarDays,
  ChefHat,
} from "lucide-react"

const frequencyLabels: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  "one-time": "One-time",
}

const statusColors: Record<SubscriptionStatus, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
}

export default function AdminSubscriptionsPage() {
  const {
    subscriptions,
    getTierById,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
  } = useChefsChoiceStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">(
    "all"
  )

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.customerName.toLowerCase().includes(query) ||
          s.customerEmail?.toLowerCase().includes(query) ||
          s.tierLabel.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [subscriptions, statusFilter, searchQuery])

  // Stats
  const activeCount = subscriptions.filter((s) => s.status === "active").length
  const pausedCount = subscriptions.filter((s) => s.status === "paused").length
  const cancelledCount = subscriptions.filter(
    (s) => s.status === "cancelled"
  ).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Subscriptions" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Back button */}
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/admin/chefs-choice">
            <ArrowLeft className="w-4 h-4" />
            Back to Chef&apos;s Choice
          </Link>
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Pause className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{pausedCount}</p>
                  <p className="text-sm text-muted-foreground">Paused</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <XCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{cancelledCount}</p>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or tier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs by Status */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as SubscriptionStatus | "all")
          }
        >
          <TabsList>
            <TabsTrigger value="all">
              All ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({pausedCount})</TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            {filteredSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No subscriptions found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSubscriptions.map((subscription) => {
                  const tier = getTierById(subscription.tierId)
                  return (
                    <Card
                      key={subscription.id}
                      className={`hover:border-primary/30 transition-colors ${
                        subscription.status === "cancelled" ? "opacity-60" : ""
                      }`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {/* Customer avatar */}
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-medium text-primary">
                                {subscription.customerName.charAt(0).toUpperCase()}
                              </span>
                            </div>

                            <div className="flex-1">
                              {/* Customer name and status */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium">
                                  {subscription.customerName}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={statusColors[subscription.status]}
                                >
                                  {subscription.status}
                                </Badge>
                              </div>

                              {/* Contact info */}
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                {subscription.customerEmail && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {subscription.customerEmail}
                                  </span>
                                )}
                                {subscription.customerPhone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {subscription.customerPhone}
                                  </span>
                                )}
                              </div>

                              {/* Subscription details */}
                              <div className="flex items-center gap-4 mt-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <ChefHat className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    {subscription.tierLabel}
                                  </span>
                                </div>
                                <Badge variant="secondary">
                                  {frequencyLabels[subscription.frequency]}
                                </Badge>
                                {subscription.tierType === "dollar" && (
                                  <span className="text-sm text-muted-foreground">
                                    {formatCurrency(subscription.tierValue)}/delivery
                                  </span>
                                )}
                              </div>

                              {/* Next delivery */}
                              {subscription.status === "active" &&
                                subscription.nextDeliveryDate && (
                                  <div className="flex items-center gap-2 mt-2 text-sm">
                                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Next delivery:{" "}
                                      {format(
                                        new Date(subscription.nextDeliveryDate),
                                        "MMM d, yyyy"
                                      )}
                                    </span>
                                  </div>
                                )}

                              {/* Created date */}
                              <p className="text-xs text-muted-foreground mt-2">
                                Subscribed{" "}
                                {format(
                                  new Date(subscription.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
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
                                    onClick={() =>
                                      pauseSubscription(subscription.id)
                                    }
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      resumeSubscription(subscription.id)
                                    }
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    cancelSubscription(subscription.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
