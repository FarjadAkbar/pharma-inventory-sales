"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth.context"

interface Unit {
  id: string
  name: string
  symbol: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { permissions } = useAuth()

  const canCreate = permissions?.MASTER_DATA?.units?.canCreate ?? false
  const canEdit = permissions?.MASTER_DATA?.units?.canUpdate ?? false
  const canDelete = permissions?.MASTER_DATA?.units?.canDelete ?? false

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockUnits: Unit[] = [
      {
        id: "1",
        name: "Kilogram",
        symbol: "kg",
        description: "Unit of mass",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "2",
        name: "Liter",
        symbol: "L",
        description: "Unit of volume",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "3",
        name: "Tablet",
        symbol: "tab",
        description: "Unit for tablets",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "4",
        name: "Box",
        symbol: "box",
        description: "Unit for packaging",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ]
    setUnits(mockUnits)
    setLoading(false)
  }, [])

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    // TODO: Implement create unit modal/form
    console.log("Create unit")
  }

  const handleEdit = (unit: Unit) => {
    // TODO: Implement edit unit modal/form
    console.log("Edit unit:", unit)
  }

  const handleDelete = (unit: Unit) => {
    // TODO: Implement delete confirmation
    console.log("Delete unit:", unit)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading units...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Manage units of measurement for products and materials
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Units List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{unit.symbol}</Badge>
                    </TableCell>
                    <TableCell>{unit.description}</TableCell>
                    <TableCell>
                      <Badge variant={unit.isActive ? "default" : "secondary"}>
                        {unit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{unit.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleEdit(unit)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(unit)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
