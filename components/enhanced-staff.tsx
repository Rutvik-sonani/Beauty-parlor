"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Plus, Star, Clock, DollarSign, Trash2, Edit } from "lucide-react"

export function EnhancedStaff() {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "Emma Wilson",
      role: "Senior Hair Stylist",
      specialization: ["Hair Cut", "Hair Color", "Hair Treatment"],
      rating: 4.9,
      experience: "8 years",
      totalClients: 450,
      monthlyRevenue: 85000,
      availability: "Available",
      shifts: "Mon-Fri 9AM-6PM",
      incentives: 12500,
      phone: "+1 234-567-8901",
      email: "emma.wilson@beautypro.com",
    },
    {
      id: 2,
      name: "Sophia Brown",
      role: "Facial Specialist",
      specialization: ["Facial Treatment", "Skin Care", "Anti-Aging"],
      rating: 4.8,
      experience: "6 years",
      totalClients: 320,
      monthlyRevenue: 65000,
      availability: "Busy",
      shifts: "Tue-Sat 10AM-7PM",
      incentives: 9800,
      phone: "+1 234-567-8902",
      email: "sophia.brown@beautypro.com",
    },
  ])

  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    experience: "",
    shifts: "",
  })

  const addStaff = () => {
    if (newStaff.name && newStaff.role && newStaff.phone && newStaff.email) {
      setStaff([
        ...staff,
        {
          id: staff.length + 1,
          ...newStaff,
          specialization: [],
          rating: 0,
          totalClients: 0,
          monthlyRevenue: 0,
          availability: "Available",
          incentives: 0,
        },
      ])
      setNewStaff({ name: "", role: "", phone: "", email: "", experience: "", shifts: "" })
    }
  }

  const removeStaff = (id: number) => {
    setStaff(staff.filter((member) => member.id !== id))
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700"
      case "Busy":
        return "bg-red-100 text-red-700"
      case "Break":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Enhanced Staff Management</h1>
          <p className="text-gray-600">Manage your team with enhanced features</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Enter staff name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  placeholder="Enter role"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="Enter email address"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={newStaff.experience}
                  onChange={(e) => setNewStaff({ ...newStaff, experience: e.target.value })}
                  placeholder="e.g., 5 years"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shifts">Work Schedule</Label>
                <Input
                  id="shifts"
                  value={newStaff.shifts}
                  onChange={(e) => setNewStaff({ ...newStaff, shifts: e.target.value })}
                  placeholder="e.g., Mon-Fri 9AM-6PM"
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={addStaff}
                disabled={!newStaff.name || !newStaff.role || !newStaff.phone || !newStaff.email}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{staff.length}</p>
                <p className="text-sm text-gray-600">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {staff.filter((s) => s.availability === "Available").length}
                </p>
                <p className="text-sm text-gray-600">Available Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{(staff.reduce((sum, s) => sum + s.monthlyRevenue, 0) / 100000).toFixed(1)}L
                </p>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {(staff.reduce((sum, s) => sum + s.rating, 0) / staff.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {staff.map((member) => (
          <Card key={member.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-gray-600">{member.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{member.rating}</span>
                      </div>
                      <Badge className={getAvailabilityColor(member.availability)}>{member.availability}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeStaff(member.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">Phone: {member.phone}</p>
                <p className="text-sm text-gray-600">Email: {member.email}</p>
                <p className="text-sm text-gray-600">Experience: {member.experience}</p>
                <p className="text-sm text-gray-600">Schedule: {member.shifts}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-lg font-semibold text-pink-600">{member.totalClients}</p>
                  <p className="text-xs text-gray-600">Total Clients</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-lg font-semibold text-purple-600">₹{(member.monthlyRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
