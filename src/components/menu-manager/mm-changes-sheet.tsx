"use client"

import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { Package, Plus, Trash2, DollarSign, Layers, Eye, FileText, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MMChangesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: () => void
}

export function MMChangesSheet({ open, onOpenChange, onPublish }: MMChangesSheetProps) {
  const { pendingChanges, discardChanges } = useMenuManagerStore()

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "inventory":
        return <Layers className="h-4 w-4" />
      case "price":
        return <DollarSign className="h-4 w-4" />
      case "new":
        return <Plus className="h-4 w-4" />
      case "delete":
        return <Trash2 className="h-4 w-4" />
      case "status":
        return <Eye className="h-4 w-4" />
      case "details":
        return <FileText className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case "new":
        return "bg-success/10 text-success border-success/20"
      case "delete":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "inventory":
        return "bg-info/10 text-info border-info/20"
      case "price":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard all changes? This cannot be undone.")) {
      discardChanges()
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Pending Changes</SheetTitle>
          <SheetDescription>
            {pendingChanges.length} change{pendingChanges.length !== 1 ? "s" : ""} waiting to be published
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 py-4">
            {pendingChanges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No pending changes</p>
              </div>
            ) : (
              pendingChanges.map((change) => (
                <div key={change.id} className={cn("p-3 rounded-lg border", getChangeColor(change.type))}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getChangeIcon(change.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{change.productName}</p>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        {change.type === "new" ? (
                          <span>New product added</span>
                        ) : change.type === "delete" ? (
                          <span>Product deleted</span>
                        ) : (
                          <>
                            <span className="opacity-70">{change.before}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-medium">{change.after}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs opacity-60 mt-1">
                        {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button variant="outline" onClick={handleDiscard} disabled={pendingChanges.length === 0}>
            Discard All
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onPublish()
            }}
            disabled={pendingChanges.length === 0}
          >
            Publish {pendingChanges.length > 0 && `(${pendingChanges.length})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
