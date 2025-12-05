"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { useChefsChoiceStore } from "@/lib/chefs-choice-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react"

export default function TemplatesListPage() {
  const { tiers, templates, deleteTemplate, addTemplate } = useChefsChoiceStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates
    const query = searchQuery.toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        tiers.find((tier) => tier.id === t.tierId)?.label.toLowerCase().includes(query)
    )
  }, [templates, searchQuery, tiers])

  // Group by active/inactive
  const activeTemplates = filteredTemplates.filter((t) => t.active)
  const inactiveTemplates = filteredTemplates.filter((t) => !t.active)

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id)
    }
  }

  // Handle duplicate
  const handleDuplicate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    addTemplate({
      tierId: template.tierId,
      name: `${template.name} (Copy)`,
      description: template.description,
      items: [...template.items],
      effectiveFrom: new Date().toISOString(),
      active: false,
      createdBy: "admin",
    })
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Templates" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header with search and add */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link href="/admin/chefs-choice/templates/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </Link>
        </div>

        {/* Active Templates */}
        <div className="space-y-3">
          <h2 className="font-medium text-muted-foreground">
            Active Templates ({activeTemplates.length})
          </h2>
          {activeTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active templates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeTemplates.map((template) => {
                const tier = tiers.find((t) => t.id === template.tierId)
                return (
                  <Card
                    key={template.id}
                    className="hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {tier?.label || "Unknown tier"}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/chefs-choice/templates/${template.id}`}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(template.id)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(template.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {template.items.length} items
                        </Badge>
                        <span>•</span>
                        <span>
                          Since {format(new Date(template.effectiveFrom), "MMM d")}
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Inactive Templates */}
        {inactiveTemplates.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium text-muted-foreground">
              Inactive Templates ({inactiveTemplates.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {inactiveTemplates.map((template) => {
                const tier = tiers.find((t) => t.id === template.tierId)
                return (
                  <Card
                    key={template.id}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {tier?.label || "Unknown tier"}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/chefs-choice/templates/${template.id}`}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(template.id)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(template.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Badge variant="outline">Inactive</Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
