"use client"

import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { History, Download, CheckCircle } from "lucide-react"

interface MMHistoryLogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMHistoryLog({ open, onOpenChange }: MMHistoryLogProps) {
  const { publishLogs } = useMenuManagerStore()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Menu History
          </SheetTitle>
          <SheetDescription>View all published menu changes</SheetDescription>
        </SheetHeader>

        <div className="flex justify-end py-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {publishLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No publish history yet</p>
              </div>
            ) : (
              publishLogs.map((log) => (
                <div key={log.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {format(new Date(log.publishedAt), "MMM d, h:mm a")} - Published by {log.publishedBy}
                    </p>
                  </div>
                  <div className="border-l-2 border-border pl-4 space-y-2">
                    {log.changes.map((change) => (
                      <div key={change.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
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
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
