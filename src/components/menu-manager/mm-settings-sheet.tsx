"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface MMSettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMSettingsSheet({ open, onOpenChange }: MMSettingsSheetProps) {
  const [settings, setSettings] = useState({
    lowStockThreshold: "10",
    showOutOfStock: true,
    showPrices: true,
    showInventory: true,
    imageQuality: "medium",
    autoResize: true,
    autoPublish: false,
    previewBeforePublish: true,
    emailOnPublish: true,
    emailOnOutOfStock: true,
    emailOnLowStock: false,
  })

  const handleChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Would save to backend in production
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu Settings</SheetTitle>
          <SheetDescription>Configure your menu display and behavior</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Default Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Default Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lowStock">Low Stock Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lowStock"
                    type="number"
                    min="0"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">units</span>
                </div>
                <p className="text-xs text-muted-foreground">Alert when any product falls below this</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show out of stock items</Label>
                  <p className="text-xs text-muted-foreground">Display grayed out to customers</p>
                </div>
                <Switch
                  checked={settings.showOutOfStock}
                  onCheckedChange={(checked) => handleChange("showOutOfStock", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show prices on all products</Label>
                <Switch
                  checked={settings.showPrices}
                  onCheckedChange={(checked) => handleChange("showPrices", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show inventory counts</Label>
                <Switch
                  checked={settings.showInventory}
                  onCheckedChange={(checked) => handleChange("showInventory", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Image Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Image Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image Quality</Label>
                <Select value={settings.imageQuality} onValueChange={(value) => handleChange("imageQuality", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (slower load)</SelectItem>
                    <SelectItem value="medium">Medium (recommended)</SelectItem>
                    <SelectItem value="low">Low (faster load)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-resize uploaded images</Label>
                  <p className="text-xs text-muted-foreground">Target: 800x800px</p>
                </div>
                <Switch
                  checked={settings.autoResize}
                  onCheckedChange={(checked) => handleChange("autoResize", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Publishing Options */}
          <div>
            <h3 className="text-sm font-medium mb-4">Publishing Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-publish changes</Label>
                  <p className="text-xs text-muted-foreground">No confirmation required</p>
                </div>
                <Switch
                  checked={settings.autoPublish}
                  onCheckedChange={(checked) => handleChange("autoPublish", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Preview before publish</Label>
                  <p className="text-xs text-muted-foreground">Recommended</p>
                </div>
                <Switch
                  checked={settings.previewBeforePublish}
                  onCheckedChange={(checked) => handleChange("previewBeforePublish", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium mb-4">Notifications</h3>
            <p className="text-xs text-muted-foreground mb-3">Email me when:</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Menu is published</Label>
                <Switch
                  checked={settings.emailOnPublish}
                  onCheckedChange={(checked) => handleChange("emailOnPublish", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Product goes out of stock</Label>
                <Switch
                  checked={settings.emailOnOutOfStock}
                  onCheckedChange={(checked) => handleChange("emailOnOutOfStock", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Low stock alert triggered</Label>
                <Switch
                  checked={settings.emailOnLowStock}
                  onCheckedChange={(checked) => handleChange("emailOnLowStock", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
