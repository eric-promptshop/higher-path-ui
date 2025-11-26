"use client"
import { Button } from "@/components/ui/button"
import { Search, Plus, BarChart3, Settings, Eye } from "lucide-react"

interface MMMobileActionsProps {
  onSearch: () => void
  onAddProduct: () => void
  onPreview: () => void
  onSettings: () => void
  onHistory: () => void
}

export function MMMobileActions({ onSearch, onAddProduct, onPreview, onSettings, onHistory }: MMMobileActionsProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-background border-t border-border px-4 py-2">
      <div className="flex items-center justify-around">
        <Button variant="ghost" size="sm" onClick={onSearch} className="flex-col h-auto py-2 gap-1">
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onAddProduct} className="flex-col h-auto py-2 gap-1">
          <Plus className="h-5 w-5" />
          <span className="text-xs">Add</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onPreview} className="flex-col h-auto py-2 gap-1">
          <Eye className="h-5 w-5" />
          <span className="text-xs">Preview</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onHistory} className="flex-col h-auto py-2 gap-1">
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs">History</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onSettings} className="flex-col h-auto py-2 gap-1">
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  )
}
