"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { Search, Plus, Edit, Trash2, Phone, Mail, Calendar, Star, Gift } from "lucide-react"
import { toast } from "sonner"

export function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loading } = useSupabaseData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTier, setSelectedTier] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    birthday: "",
    age: "",
    whatsapp: "",
    notes: "",
  })

  // Group customers by phone number and get the most recent one for each phone
  const getUniqueCustomersByPhone = () => {
    const phoneGroups = customers.reduce((groups, customer) => {
      const phone = customer.phone
      if (!groups[phone]) {
        groups[phone] = []
      }
      groups[phone].push(customer)
      return groups
    }, {} as Record<string, typeof customers>)

    // For each phone number, get the customer with the most recent created_at date
    return Object.values(phoneGroups).map(group => {
      return group.reduce((latest, current) => {
        const latestDate = new Date(latest.created_at)
        const currentDate = new Date(current.created_at)
        return currentDate > latestDate ? current : latest
      })
    })
  }

  const uniqueCustomersByPhone = getUniqueCustomersByPhone()

  // Get customers with duplicate phone numbers
  const getDuplicatePhoneNumbers = () => {
    const phoneCounts = customers.reduce((counts, customer) => {
      counts[customer.phone] = (counts[customer.phone] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    return Object.entries(phoneCounts)
      .filter(([phone, count]) => count > 1)
      .map(([phone]) => phone)
  }

  const duplicatePhoneNumbers = getDuplicatePhoneNumbers()

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = selectedTier === "all" || customer.tier === selectedTier
    return matchesSearch && matchesTier
  })

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Name and phone are required")
      return
    }

    // Check if phone number already exists
    const existingCustomer = customers.find(c => c.phone === newCustomer.phone)
    if (existingCustomer) {
      const confirmAdd = confirm(
        `Phone number ${newCustomer.phone} already exists for customer "${existingCustomer.name}".\n\nDo you want to add this as a new customer record?`
      )
      if (!confirmAdd) {
        return
      }
    }

    try {
      await addCustomer({
        ...newCustomer,
        age: newCustomer.age ? Number.parseInt(newCustomer.age) : null,
        birthday: newCustomer.birthday || null,
        tier: "Bronze",
        status: "Active",
        loyalty_points: 0,
        total_visits: 0,
        last_visit: null,
        favorite_service: null,
        total_spent: 0,
        join_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        birthday: "",
        age: "",
        whatsapp: "",
        notes: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding customer:", error)
    }
  }

  const handleEditCustomer = async () => {
    if (!editingCustomer) return

    try {
      await updateCustomer(editingCustomer.id, {
        ...editingCustomer,
        age: editingCustomer.age ? Number.parseInt(editingCustomer.age) : null,
      })
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
    } catch (error) {
      console.error("Error updating customer:", error)
    }
  }

  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      await deleteCustomer(customerId)
    } catch (error) {
      console.error("Error deleting customer:", error)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "bg-amber-100 text-amber-800"
      case "Silver":
        return "bg-gray-100 text-gray-800"
      case "Gold":
        return "bg-yellow-100 text-yellow-800"
      case "Platinum":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="p-6">Loading customers...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={newCustomer.whatsapp}
                    onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={newCustomer.birthday}
                    onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newCustomer.age}
                    onChange={(e) => setNewCustomer({ ...newCustomer, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomer} className="flex-1">
                  Add Customer
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueCustomersByPhone.length}</div>
            <p className="text-xs text-muted-foreground">Unique Customers</p>
            <p className="text-xs text-muted-foreground">(by phone number)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-xs text-muted-foreground">(all entries)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueCustomersByPhone.filter((c) => c.tier === "Gold").length}</div>
            <p className="text-xs text-muted-foreground">Gold Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueCustomersByPhone.filter((c) => c.tier === "Platinum").length}</div>
            <p className="text-xs text-muted-foreground">Platinum Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {uniqueCustomersByPhone.reduce((sum, c) => sum + (c.loyalty_points || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Loyalty Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Phone Numbers Section */}
      {duplicatePhoneNumbers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Duplicate Phone Numbers</h3>
              <p className="text-sm text-muted-foreground">
                Found {duplicatePhoneNumbers.length} phone numbers with multiple customers
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {duplicatePhoneNumbers.map((phone) => {
              const customersWithPhone = customers
                .filter(c => c.phone === phone)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              
              return (
                <Card key={phone}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-semibold">{phone}</h4>
                      <Badge variant="secondary">{customersWithPhone.length} customers</Badge>
                    </div>
                    <div className="space-y-3">
                      {customersWithPhone.map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{customer.name}</span>
                              {index === 0 && <Badge className="bg-green-100 text-green-800">Latest</Badge>}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Created: {new Date(customer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCustomer(customer)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedTier !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Add your first customer to get started"}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <Badge className={getTierColor(customer.tier)}>{customer.tier}</Badge>
                      {customer.status === "Inactive" && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.birthday && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(customer.birthday).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.loyalty_points || 0} points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.total_visits || 0} visits</span>
                        </div>
                        {customer.total_spent > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Total spent: ${customer.total_spent.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {customer.last_visit && (
                          <div className="text-sm text-muted-foreground">
                            Last visit: {new Date(customer.last_visit).toLocaleDateString()}
                          </div>
                        )}
                        {customer.favorite_service && (
                          <div className="text-sm text-muted-foreground">Favorite: {customer.favorite_service}</div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Member since: {new Date(customer.join_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {customer.notes && (
                      <div className="mt-3 p-2 bg-muted rounded text-sm">
                        <strong>Notes:</strong> {customer.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCustomer(customer)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCustomer.email || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tier">Tier</Label>
                  <Select
                    value={editingCustomer.tier}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-birthday">Birthday</Label>
                  <Input
                    id="edit-birthday"
                    type="date"
                    value={editingCustomer.birthday || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, birthday: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingCustomer.status}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingCustomer.notes || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditCustomer} className="flex-1">
                  Update Customer
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
