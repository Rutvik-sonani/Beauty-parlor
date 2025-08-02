"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Phone, Mail, MessageCircle, Calendar, Trash2, Edit, Search } from "lucide-react"

export function EnhancedCustomers() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 234-567-8901",
      whatsapp: "+1 234-567-8901",
      age: 28,
      lastVisit: "2024-01-15",
      totalVisits: 12,
      totalSpent: 18500,
      status: "VIP",
      preferences: "Natural colors, sensitive skin",
      joinDate: "2023-03-15",
    },
    {
      id: 2,
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@email.com",
      phone: "+1 234-567-8902",
      whatsapp: "+1 234-567-8902",
      age: 32,
      lastVisit: "2024-01-12",
      totalVisits: 8,
      totalSpent: 12000,
      status: "Regular",
      preferences: "Bold colors, loves experimenting",
      joinDate: "2023-06-20",
    },
    {
      id: 3,
      firstName: "Jessica",
      lastName: "Wilson",
      email: "jessica.wilson@email.com",
      phone: "+1 234-567-8903",
      whatsapp: "+1 234-567-8903",
      age: 25,
      lastVisit: "2024-01-10",
      totalVisits: 15,
      totalSpent: 22000,
      status: "VIP",
      preferences: "French tips, classic styles",
      joinDate: "2023-01-10",
    },
  ])

  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    age: "",
    preferences: "",
  })

  const [searchTerm, setSearchTerm] = useState("")

  const addCustomer = () => {
    if (newCustomer.firstName && newCustomer.lastName && newCustomer.email && newCustomer.phone) {
      setCustomers([
        ...customers,
        {
          id: customers.length + 1,
          ...newCustomer,
          age: Number.parseInt(newCustomer.age) || 0,
          lastVisit: new Date().toISOString().split("T")[0],
          totalVisits: 0,
          totalSpent: 0,
          status: "New",
          joinDate: new Date().toISOString().split("T")[0],
        },
      ])
      setNewCustomer({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        whatsapp: "",
        age: "",
        preferences: "",
      })
    }
  }

  const removeCustomer = (id: number) => {
    setCustomers(customers.filter((customer) => customer.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP":
        return "bg-purple-100 text-purple-700"
      case "Regular":
        return "bg-blue-100 text-blue-700"
      case "New":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Enhanced Customer Management</h1>
          <p className="text-gray-600">Manage customer information with age, WhatsApp, and preferences</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    placeholder="First name"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    placeholder="Last name"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+1 234-567-8900"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={newCustomer.whatsapp}
                    onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                    placeholder="+1 234-567-8900"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newCustomer.age}
                  onChange={(e) => setNewCustomer({ ...newCustomer, age: e.target.value })}
                  placeholder="25"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferences & Notes</Label>
                <Input
                  id="preferences"
                  value={newCustomer.preferences}
                  onChange={(e) => setNewCustomer({ ...newCustomer, preferences: e.target.value })}
                  placeholder="Customer preferences, allergies, etc."
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={addCustomer}
                disabled={!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.phone}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge className="h-8 w-8 bg-purple-600 text-white flex items-center justify-center rounded-full">
                VIP
              </Badge>
              <div>
                <p className="text-2xl font-bold text-gray-800">{customers.filter((c) => c.status === "VIP").length}</p>
                <p className="text-sm text-gray-600">VIP Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {customers.reduce((sum, customer) => sum + customer.totalVisits, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{customers.filter((c) => c.whatsapp).length}</p>
                <p className="text-sm text-gray-600">WhatsApp Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {customer.firstName[0]}
                    {customer.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                      {customer.whatsapp && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {customer.whatsapp}
                        </div>
                      )}
                      <span>Age: {customer.age}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>
                        {customer.totalVisits} visits • ₹{customer.totalSpent.toLocaleString()}
                      </p>
                      <p>Last visit: {customer.lastVisit}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="rounded-lg">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCustomer(customer.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              {customer.preferences && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Preferences:</strong> {customer.preferences}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
