"use client"

import { useMenuManagerStore, type MenuProduct } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatDistanceToNow } from "date-fns"
import { History, Package } from "lucide-react"

interface MMHistorySheetProps {
  product: MenuProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMHistorySheet({ product, open, onOpenChange }: MMHistorySheetProps) {
  const { publishLogs, pendingChanges } = useMenuManagerStore()

  if (!product) return null

  // Get changes related to this product
  const productPending = pendingChanges.filter((c) => c.productId === product.id)
  const productHistory = publishLogs.flatMap((log) =>
    log.changes
      .filter((c) => c.productId === product.id)
      .map((c) => ({ ...c, publishedAt: log.publishedAt, publishedBy: log.publishedBy })),
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </SheetTitle>
          <SheetDescription>{product.name}</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Pending Changes */}
          {productPending.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Unpublished Changes</h3>
              <div className="space-y-3">
                {productPending.map((change) => (
                  <div key={change.id} className="p-3 bg-info/10 border border-info/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {change.type === "inventory" ? "Stock" : change.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {change.before} → {change.after}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published History */}
          {productHistory.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Published Changes</h3>
              <div className="space-y-3">
                {productHistory.map((change, index) => (
                  <div key={`${change.id}-${index}`} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {change.type === "inventory" ? "Stock" : change.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(change.publishedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {change.before} → {change.after}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">by {change.publishedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : productPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No change history available</p>
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="outline" className="w-full bg-transparent" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
