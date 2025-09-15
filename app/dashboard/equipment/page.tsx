"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, Settings, Wrench } from "lucide-react"
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

interface Equipment {
  id: string
  name: string
  code: string
  type: string
  location: string
  status: "operational" | "maintenance" | "out_of_service"
  lastMaintenance: string
  nextMaintenance: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { permissions } = useAuth()

  const canCreate = permissions?.MASTER_DATA?.equipment?.canCreate ?? false
  const canEdit = permissions?.MASTER_DATA?.equipment?.canUpdate ?? false
  const canDelete = permissions?.MASTER_DATA?.equipment?.canDelete ?? false

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockEquipment: Equipment[] = [
      {
        id: "1",
        name: "Tablet Press Machine",
        code: "TPM-001",
        type: "Manufacturing",
        location: "Production Hall A",
        status: "operational",
        lastMaintenance: "2024-01-15",
        nextMaintenance: "2024-04-15",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "2",
        name: "Coating Machine",
        code: "CM-002",
        type: "Manufacturing",
        location: "Production Hall B",
        status: "maintenance",
        lastMaintenance: "2024-02-01",
        nextMaintenance: "2024-05-01",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "3",
        name: "Packaging Line",
        code: "PL-003",
        type: "Packaging",
        location: "Packaging Area",
        status: "operational",
        lastMaintenance: "2024-01-20",
        nextMaintenance: "2024-04-20",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "4",
        name: "Quality Control Equipment",
        code: "QC-004",
        type: "Testing",
        location: "QC Lab",
        status: "operational",
        lastMaintenance: "2024-01-10",
        nextMaintenance: "2024-04-10",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ]
    setEquipment(mockEquipment)
    setLoading(false)
  }, [])

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: Equipment["status"]) => {
    switch (status) {
      case "operational":
        return <Badge variant="default">Operational</Badge>
      case "maintenance":
        return <Badge variant="secondary">Maintenance</Badge>
      case "out_of_service":
        return <Badge variant="destructive">Out of Service</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCreate = () => {
    // TODO: Implement create equipment modal/form
    console.log("Create equipment")
  }

  const handleEdit = (item: Equipment) => {
    // TODO: Implement edit equipment modal/form
    console.log("Edit equipment:", item)
  }

  const handleDelete = (item: Equipment) => {
    // TODO: Implement delete confirmation
    console.log("Delete equipment:", item)
  }

  const handleMaintenance = (item: Equipment) => {
    // TODO: Implement maintenance scheduling
    console.log("Schedule maintenance for:", item)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading equipment...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground">
            Manage manufacturing and testing equipment
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
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
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.code}</Badge>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.nextMaintenance}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleMaintenance(item)}>
                            <Wrench className="mr-2 h-4 w-4" />
                            Maintenance
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(item)}
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
