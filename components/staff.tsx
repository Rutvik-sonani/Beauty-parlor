"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"

interface Staff {
  id: number
  name: string
  role: string
  specialization: string[]
  experience: string
  rating: number
  phone: string
  email: string
  salary: number
  status: string
  availability: string
  join_date: string
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Star, Clock, DollarSign, Calendar, Edit, UserPlus, Phone, Mail, Trash2, AlertCircle } from "lucide-react"

export function Staff() {
  const { staff, addStaff: addStaffToDB, updateStaff: updateStaffInDB, deleteStaff: deleteStaffFromDB, syncing } = useSupabaseData()
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [showSchedule, setShowSchedule] = useState<Staff | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<Staff | null>(null)

  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    experience: "",
    salary: "",
    address: "",
    emergency_contact: "",
    specialization: "",
    status: "Active"
  })

  // Calculate dynamic statistics
  const stats = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'Active')
    const availableStaff = activeStaff.filter(s => s.availability === 'Available')
    const avgRating = staff.length > 0 ? (staff.reduce((sum, s) => sum + (s.rating || 0), 0) / staff.length).toFixed(1) : 0
    const totalSalary = staff.reduce((sum, s) => sum + (s.salary || 0), 0)

    return {
      totalStaff: staff.length,
      activeStaff: activeStaff.length,
      availableStaff: availableStaff.length,
      avgRating,
      totalSalary
    }
  }, [staff])

  const addStaff = async () => {
    if (!newStaff.name || !newStaff.role || !newStaff.phone || !newStaff.email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await addStaffToDB({
        name: newStaff.name,
        role: newStaff.role,
        phone: newStaff.phone,
        email: newStaff.email,
        specialization: newStaff.specialization ? newStaff.specialization.split(',').map(s => s.trim()) : [],
        experience: newStaff.experience,
        salary: parseFloat(newStaff.salary) || 0,
        status: newStaff.status,
        availability: 'Available',
        join_date: new Date().toISOString().split('T')[0],
        address: newStaff.address || null,
        emergency_contact: newStaff.emergency_contact || null,
        rating: 0
      })
      
      setNewStaff({
        name: "",
        role: "",
        phone: "",
        email: "",
        experience: "",
        salary: "",
        address: "",
        emergency_contact: "",
        specialization: "",
        status: "Active"
      })
      setShowAddDialog(false)
      toast.success('Staff member added successfully!')
    } catch (error) {
      console.error('Error adding staff:', error)
      toast.error('Failed to add staff member')
    }
  }

  const updateStaff = async () => {
    if (!editingStaff) return

    try {
      await updateStaffInDB(editingStaff.id, {
        name: editingStaff.name,
        role: editingStaff.role,
        phone: editingStaff.phone,
        email: editingStaff.email,
        specialization: editingStaff.specialization,
        experience: editingStaff.experience,
        salary: editingStaff.salary,
        status: editingStaff.status,
        availability: editingStaff.availability,
        address: editingStaff.address,
        emergency_contact: editingStaff.emergency_contact
      })
      
      setEditingStaff(null)
      toast.success('Staff member updated successfully!')
    } catch (error) {
      console.error('Error updating staff:', error)
      toast.error('Failed to update staff member')
    }
  }

  const deleteStaff = async (staffId: number) => {
    try {
      await deleteStaffFromDB(staffId)
      setShowDeleteDialog(null)
      toast.success('Staff member deleted successfully!')
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('Failed to delete staff member')
    }
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700"
      case "Busy":
        return "bg-red-100 text-red-700"
      case "Break":
        return "bg-yellow-100 text-yellow-700"
      case "Off":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Inactive":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600">Manage your team members and their schedules</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStaff}</p>
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
                <p className="text-2xl font-bold text-gray-800">{stats.availableStaff}</p>
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
                  ₹{(stats.totalSalary / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Total Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.avgRating}</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Cards */}
      {staff.length === 0 ? (
        <Card className="rounded-2xl border-pink-100">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Staff Members</h3>
            <p className="text-gray-600 mb-4">Add your first staff member to get started</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                          <span className="text-sm font-medium">{member.rating || 0}</span>
                        </div>
                        <Badge className={getAvailabilityColor(member.availability)}>
                          {member.availability || 'Unknown'}
                        </Badge>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  {member.experience && (
                    <p className="text-sm text-gray-600">Experience: {member.experience}</p>
                  )}
                  {member.specialization && member.specialization.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Specialization: {Array.isArray(member.specialization) ? member.specialization.join(', ') : member.specialization}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-pink-50 rounded-xl">
                    <p className="text-lg font-semibold text-pink-600">₹{(member.salary || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Monthly Salary</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <p className="text-lg font-semibold text-purple-600">
                      {member.join_date ? new Date(member.join_date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">Join Date</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingStaff({ ...member })}
                    className="flex-1 rounded-lg"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(member)}
                    className="flex-1 rounded-lg text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="Phone number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary (₹)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={newStaff.salary}
                  onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                  placeholder="Monthly salary"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                placeholder="Email address"
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
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={newStaff.specialization}
                onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                placeholder="Hair Cut, Hair Color (comma separated)"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStaff.status}
                onValueChange={(value) => setNewStaff({ ...newStaff, status: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newStaff.address}
                onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                placeholder="Full address"
                className="rounded-xl"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={newStaff.emergency_contact}
                onChange={(e) => setNewStaff({ ...newStaff, emergency_contact: e.target.value })}
                placeholder="Emergency contact number"
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={addStaff}
              disabled={!newStaff.name || !newStaff.role || !newStaff.phone || !newStaff.email || syncing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              {syncing ? 'Adding...' : 'Add Staff Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Edit Staff Profile</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Input
                  id="editRole"
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSalary">Salary (₹)</Label>
                  <Input
                    id="editSalary"
                    type="number"
                    value={editingStaff.salary}
                    onChange={(e) => setEditingStaff({ ...editingStaff, salary: parseFloat(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editExperience">Experience</Label>
                <Input
                  id="editExperience"
                  value={editingStaff.experience}
                  onChange={(e) => setEditingStaff({ ...editingStaff, experience: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialization">Specialization</Label>
                <Input
                  id="editSpecialization"
                  value={Array.isArray(editingStaff.specialization) ? editingStaff.specialization.join(', ') : editingStaff.specialization}
                  onChange={(e) => setEditingStaff({ ...editingStaff, specialization: e.target.value.split(',').map(s => s.trim()) })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAvailability">Availability</Label>
                <Select
                  value={editingStaff.availability}
                  onValueChange={(value) => setEditingStaff({ ...editingStaff, availability: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Break">On Break</SelectItem>
                    <SelectItem value="Off">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editingStaff.status}
                  onValueChange={(value) => setEditingStaff({ ...editingStaff, status: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAddress">Address</Label>
                <Textarea
                  id="editAddress"
                  value={editingStaff.address || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, address: e.target.value })}
                  className="rounded-xl"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmergency">Emergency Contact</Label>
                <Input
                  id="editEmergency"
                  value={editingStaff.emergency_contact || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, emergency_contact: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={updateStaff}
                disabled={syncing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {syncing ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Delete Staff Member
            </DialogTitle>
          </DialogHeader>
          {showDeleteDialog && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{showDeleteDialog.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowDeleteDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
                  onClick={() => deleteStaff(showDeleteDialog.id)}
                  disabled={syncing}
                >
                  {syncing ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
