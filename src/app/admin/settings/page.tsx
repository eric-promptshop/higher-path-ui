"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building, Truck, Bell, Users, Plus, MoreHorizontal, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const teamMembers = [
  { id: "1", name: "Ryan", email: "ryan@higherpath.example", role: "Admin", lastActive: "2 minutes ago" },
  { id: "2", name: "Oriana", email: "oriana@higherpath.example", role: "Manager", lastActive: "1 hour ago" },
  {
    id: "3",
    name: "Delivery Team",
    email: "delivery@higherpath.example",
    role: "Fulfillment",
    lastActive: "Yesterday",
  },
]

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("Higher Path Flower")
  const [contactPhone, setContactPhone] = useState("(555) 123-4567")
  const [supportEmail, setSupportEmail] = useState("support@higherpath.example")

  const [standardFee, setStandardFee] = useState("15")
  const [expressFee, setExpressFee] = useState("25")
  const [standardDays, setStandardDays] = useState("1-2")
  const [expressCutoff, setExpressCutoff] = useState("14:00")
  const [lowStockThreshold, setLowStockThreshold] = useState("10")

  const [autoConfirmations, setAutoConfirmations] = useState(true)
  const [autoStatusUpdates, setAutoStatusUpdates] = useState(true)
  const [requireAddress, setRequireAddress] = useState(true)
  const [allowNotes, setAllowNotes] = useState(true)
  const [enableTipping, setEnableTipping] = useState(false)

  const [smsNewOrders, setSmsNewOrders] = useState(true)
  const [emailLowStock, setEmailLowStock] = useState(true)
  const [emailDailySummary, setEmailDailySummary] = useState(false)
  const [smsSystemAlerts, setSmsSystemAlerts] = useState(true)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("manager")
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Settings" />

      <main className="p-4 lg:p-6">
        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="business" className="gap-2">
              <Building className="w-4 h-4" /> Business
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-2">
              <Truck className="w-4 h-4" /> Delivery
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" /> Team
            </TabsTrigger>
          </TabsList>

          {/* Business Settings */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your business details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Support Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Settings</CardTitle>
                <CardDescription>Configure how orders work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto-send order confirmations</p>
                    <p className="text-xs text-muted-foreground">Send confirmation when order is placed</p>
                  </div>
                  <Switch checked={autoConfirmations} onCheckedChange={setAutoConfirmations} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto-send status updates</p>
                    <p className="text-xs text-muted-foreground">Notify customers when status changes</p>
                  </div>
                  <Switch checked={autoStatusUpdates} onCheckedChange={setAutoStatusUpdates} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Require delivery address</p>
                    <p className="text-xs text-muted-foreground">Address must be provided at checkout</p>
                  </div>
                  <Switch checked={requireAddress} onCheckedChange={setRequireAddress} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Allow customer notes</p>
                    <p className="text-xs text-muted-foreground">Customers can add notes to orders</p>
                  </div>
                  <Switch checked={allowNotes} onCheckedChange={setAllowNotes} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable tipping</p>
                    <p className="text-xs text-muted-foreground">Allow customers to add tips</p>
                  </div>
                  <Switch checked={enableTipping} onCheckedChange={setEnableTipping} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </TabsContent>

          {/* Delivery Settings */}
          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Fees</CardTitle>
                <CardDescription>Set delivery pricing for different options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="standardFee">Standard Delivery Fee</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="standardFee"
                        type="number"
                        value={standardFee}
                        onChange={(e) => setStandardFee(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expressFee">Express Delivery Fee</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="expressFee"
                        type="number"
                        value={expressFee}
                        onChange={(e) => setExpressFee(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Times</CardTitle>
                <CardDescription>Configure delivery time windows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="standardDays">Standard Delivery Time</Label>
                    <Select value={standardDays} onValueChange={setStandardDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">Same day</SelectItem>
                        <SelectItem value="1">1 business day</SelectItem>
                        <SelectItem value="1-2">1-2 business days</SelectItem>
                        <SelectItem value="2-3">2-3 business days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expressCutoff">Express Order Cutoff</Label>
                    <Input
                      id="expressCutoff"
                      type="time"
                      value={expressCutoff}
                      onChange={(e) => setExpressCutoff(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Orders after this time ship next day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
                <CardDescription>Configure inventory alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="threshold">Low Stock Threshold (Default)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Alert when products fall below this quantity</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">New order notifications</p>
                    <p className="text-xs text-muted-foreground">Receive SMS when new orders come in</p>
                  </div>
                  <Switch checked={smsNewOrders} onCheckedChange={setSmsNewOrders} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Low stock alerts</p>
                    <p className="text-xs text-muted-foreground">Email when products are low</p>
                  </div>
                  <Switch checked={emailLowStock} onCheckedChange={setEmailLowStock} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Daily summary report</p>
                    <p className="text-xs text-muted-foreground">Receive daily sales summary via email</p>
                  </div>
                  <Switch checked={emailDailySummary} onCheckedChange={setEmailDailySummary} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">System alerts</p>
                    <p className="text-xs text-muted-foreground">Critical alerts via SMS + Email</p>
                  </div>
                  <Switch checked={smsSystemAlerts} onCheckedChange={setSmsSystemAlerts} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage who has access to your admin dashboard</CardDescription>
                  </div>
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" /> Invite User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>Send an invitation to join your team</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail">Email Address</Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="team@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inviteRole">Role</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="fulfillment">Fulfillment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Role Permissions:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {inviteRole === "admin" && (
                              <>
                                <li>View and edit orders</li>
                                <li>Manage menu and inventory</li>
                                <li>View reports</li>
                                <li>Manage users and settings</li>
                              </>
                            )}
                            {inviteRole === "manager" && (
                              <>
                                <li>View and edit orders</li>
                                <li>Manage menu and inventory</li>
                                <li>View reports</li>
                                <li className="text-muted-foreground/50">Cannot manage users</li>
                              </>
                            )}
                            {inviteRole === "fulfillment" && (
                              <>
                                <li>View orders</li>
                                <li>Update order status</li>
                                <li className="text-muted-foreground/50">Cannot edit menu</li>
                                <li className="text-muted-foreground/50">Cannot view reports</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsInviteOpen(false)}>
                          <Mail className="w-4 h-4 mr-2" /> Send Invite
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                            {member.role}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">Active {member.lastActive}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
