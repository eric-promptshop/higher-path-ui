"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { useChefsChoiceStore, type TierType } from "@/lib/chefs-choice-store"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChefHat,
  DollarSign,
  Package,
  Sparkles,
  ArrowRight,
  Check,
  Star,
} from "lucide-react"

export default function ChefsChoicePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { getDollarTiers, getVolumeTiers, getCurrentTemplateForTier } =
    useChefsChoiceStore()

  const [selectedTierType, setSelectedTierType] = useState<TierType>("dollar")

  const dollarTiers = getDollarTiers()
  const volumeTiers = getVolumeTiers()

  const handleSelectTier = (tierId: string) => {
    if (!user) {
      router.push("/login?redirect=/shop/chefs-choice")
      return
    }
    router.push(`/shop/chefs-choice/checkout?tierId=${tierId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} searchQuery="" />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Chef&apos;s Choice
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let our experts curate the perfect selection for you. Choose your
            budget or volume preference and we&apos;ll handle the rest.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Expert Curation</p>
              <p className="text-sm text-muted-foreground">
                Hand-picked selections by our team
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Premium Quality</p>
              <p className="text-sm text-muted-foreground">
                Only our best products included
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Surprise & Delight</p>
              <p className="text-sm text-muted-foreground">
                Discover new favorites each time
              </p>
            </div>
          </div>
        </div>

        {/* Tier Selection */}
        <Tabs
          value={selectedTierType}
          onValueChange={(v) => setSelectedTierType(v as TierType)}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="dollar" className="gap-2">
              <DollarSign className="w-4 h-4" />
              By Price
            </TabsTrigger>
            <TabsTrigger value="volume" className="gap-2">
              <Package className="w-4 h-4" />
              By Volume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dollar" className="mt-0">
            {dollarTiers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No price tiers available at the moment</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {dollarTiers.map((tier, index) => {
                  const template = getCurrentTemplateForTier(tier.id)
                  const isPopular = index === 1 // Middle tier
                  return (
                    <Card
                      key={tier.id}
                      className={`relative overflow-hidden hover:border-primary/50 transition-colors ${
                        isPopular ? "border-primary ring-1 ring-primary" : ""
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                          Most Popular
                        </div>
                      )}
                      <CardContent className="pt-6">
                        <div className="text-center mb-6">
                          <p className="text-4xl font-bold">
                            {formatCurrency(tier.value)}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {tier.label}
                          </p>
                        </div>

                        {tier.description && (
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            {tier.description}
                          </p>
                        )}

                        {template && (
                          <div className="space-y-2 mb-6">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              What&apos;s Included
                            </p>
                            <ul className="space-y-1.5">
                              {template.items.slice(0, 4).map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                                  <span>
                                    {item.productName}
                                    {item.notes && (
                                      <span className="text-muted-foreground">
                                        {" "}
                                        ({item.notes})
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                              {template.items.length > 4 && (
                                <li className="text-sm text-muted-foreground pl-6">
                                  + {template.items.length - 4} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <Button
                          onClick={() => handleSelectTier(tier.id)}
                          className="w-full gap-2"
                          variant={isPopular ? "default" : "outline"}
                        >
                          Select
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="volume" className="mt-0">
            {volumeTiers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No volume tiers available at the moment</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {volumeTiers.map((tier, index) => {
                  const template = getCurrentTemplateForTier(tier.id)
                  const isPopular = index === 1 // Middle tier
                  return (
                    <Card
                      key={tier.id}
                      className={`relative overflow-hidden hover:border-primary/50 transition-colors ${
                        isPopular ? "border-primary ring-1 ring-primary" : ""
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                          Most Popular
                        </div>
                      )}
                      <CardContent className="pt-6">
                        <div className="text-center mb-6">
                          <p className="text-4xl font-bold">{tier.value}oz</p>
                          <p className="text-muted-foreground mt-1">
                            {tier.label}
                          </p>
                        </div>

                        {tier.description && (
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            {tier.description}
                          </p>
                        )}

                        {template && (
                          <div className="space-y-2 mb-6">
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              What&apos;s Included
                            </p>
                            <ul className="space-y-1.5">
                              {template.items.slice(0, 4).map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                                  <span>
                                    {item.productName}
                                    {item.notes && (
                                      <span className="text-muted-foreground">
                                        {" "}
                                        ({item.notes})
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                              {template.items.length > 4 && (
                                <li className="text-sm text-muted-foreground pl-6">
                                  + {template.items.length - 4} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <Button
                          onClick={() => handleSelectTier(tier.id)}
                          className="w-full gap-2"
                          variant={isPopular ? "default" : "outline"}
                        >
                          Select
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* FAQ / Info */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-4 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium mb-1">Choose Your Tier</h3>
              <p className="text-sm text-muted-foreground">
                Select by price or volume preference
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium mb-1">Set Your Frequency</h3>
              <p className="text-sm text-muted-foreground">
                One-time or subscribe for regular deliveries
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium mb-1">Enjoy Your Selection</h3>
              <p className="text-sm text-muted-foreground">
                We curate the perfect products for you
              </p>
            </div>
          </div>
        </div>

        {/* Back to Shop */}
        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button variant="ghost">Or browse our full menu</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
