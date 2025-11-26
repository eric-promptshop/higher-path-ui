"use client"

import { useState } from "react"
import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Loader2, X } from "lucide-react"

interface MMPublishBarProps {
  onViewChanges: () => void
}

export function MMPublishBar({ onViewChanges }: MMPublishBarProps) {
  const { pendingChanges, discardChanges, publishMenu } = useMenuManagerStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const changeCount = pendingChanges.length

  if (changeCount === 0) return null

  const handlePublish = async () => {
    setIsPublishing(true)
    // Simulate publish delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    publishMenu("VA")
    setIsPublishing(false)
    setShowConfirm(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard all changes?")) {
      discardChanges()
    }
  }

  return (
    <>
      {/* Floating bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-info animate-pulse" />
            <span className="text-sm font-medium">Unpublished Changes ({changeCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onViewChanges} className="hidden sm:flex">
              View Changes
            </Button>
            <Button variant="outline" size="sm" onClick={handleDiscard}>
              Discard
            </Button>
            <Button size="sm" onClick={() => setShowConfirm(true)}>
              Publish Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden */}
      <div className="h-16" />

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Menu Changes?</DialogTitle>
            <DialogDescription>
              You have {changeCount} unpublished change{changeCount !== 1 ? "s" : ""}:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2 py-2">
            {pendingChanges.slice(0, 10).map((change) => (
              <div key={change.id} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span className="font-medium">{change.productName}:</span>
                <span className="text-muted-foreground">
                  {change.type === "inventory" && `Stock ${change.before} → ${change.after}`}
                  {change.type === "price" && `Price ${change.before} → ${change.after}`}
                  {change.type === "new" && "Added"}
                  {change.type === "delete" && "Deleted"}
                  {change.type === "status" && `${change.before} → ${change.after}`}
                  {change.type === "details" && "Details updated"}
                </span>
              </div>
            ))}
            {pendingChanges.length > 10 && (
              <p className="text-sm text-muted-foreground">...and {pendingChanges.length - 10} more</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">These changes will be visible to customers immediately.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isPublishing}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Menu Published Successfully!</span>
          <button onClick={() => setShowSuccess(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
