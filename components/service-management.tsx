"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, Clock, DollarSign, AlertCircle } from "lucide-react"

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: string
  category: string
  status: string
  image?: string
}

export function ServiceManagement() {
  const { services, addService, updateService, deleteService, syncing } = useSupabaseData()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddingService, setIsAddingService] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<Service | null>(null)

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    status: "Active"
  })

  // Calculate dynamic statistics
  const stats = useMemo(() => {
    const activeServices = services.filter(s => s.status === 'Active')
    const totalRevenue = activeServices.reduce((sum, s) => sum + s.price, 0)
    const avgPrice = activeServices.length > 0 ? (totalRevenue / activeServices.length).toFixed(0) : 0

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      totalRevenue,
      avgPrice
    }
  }, [services])

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, searchTerm, selectedCategory])

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    return [...new Set(services.map((s) => s.category))]
  }, [services])

  const handleAddService = async () => {
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration || !serviceForm.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await addService({
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price) || 0,
        duration: serviceForm.duration,
        category: serviceForm.category,
        status: serviceForm.status
      })
      
      setServiceForm({ name: "", description: "", price: "", duration: "", category: "", status: "Active" })
      setIsAddingService(false)
      toast.success('Service added successfully!')
    } catch (error) {
      console.error('Error adding service:', error)
      toast.error('Failed to add service')
    }
  }

  const handleEditService = async () => {
    if (!editingService) return

    try {
      await updateService(editingService.id, {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price) || 0,
        duration: serviceForm.duration,
        category: serviceForm.category,
        status: serviceForm.status
      })
      
      setEditingService(null)
      setServiceForm({ name: "", description: "", price: "", duration: "", category: "", status: "Active" })
      toast.success('Service updated successfully!')
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error('Failed to update service')
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    try {
      await deleteService(serviceId)
      setShowDeleteDialog(null)
      toast.success('Service deleted successfully!')
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  const startEdit = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      category: service.category,
      status: service.status
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
          <p className="text-gray-600">Manage your salon services and categories</p>
        </div>
        <Button
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
          onClick={() => setIsAddingService(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Service Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalServices}</p>
                <p className="text-sm text-gray-600">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.activeServices}</p>
                <p className="text-sm text-gray-600">Active Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">₹{stats.avgPrice}</p>
                <p className="text-sm text-gray-600">Avg Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-pink-200"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 rounded-xl border-pink-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card className="rounded-2xl border-pink-100">
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-4">Add your first service to get started</p>
            <Button
              onClick={() => setIsAddingService(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-800">{service.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 border-pink-200 text-pink-700">
                      {service.category}
                    </Badge>
                  </div>
                  <Badge
                    className={service.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                  >
                    {service.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{service.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-purple-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">₹{service.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{service.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => startEdit(service)} 
                    className="flex-1 rounded-lg"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(service)}
                    className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
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

      {/* Add/Edit Service Dialog */}
      <Dialog
        open={isAddingService || !!editingService}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingService(false)
            setEditingService(null)
            setServiceForm({ name: "", description: "", price: "", duration: "", category: "", status: "Active" })
          }
        }}
      >
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="rounded-xl"
                  placeholder="Enter service name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={serviceForm.category}
                  onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair Care">Hair Care</SelectItem>
                    <SelectItem value="Skin Care">Skin Care</SelectItem>
                    <SelectItem value="Nail Care">Nail Care</SelectItem>
                    <SelectItem value="Makeup">Makeup</SelectItem>
                    <SelectItem value="Wellness">Wellness</SelectItem>
                    <SelectItem value="Massage">Massage</SelectItem>
                    <SelectItem value="Facial">Facial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                className="rounded-xl"
                rows={3}
                placeholder="Describe the service"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  className="rounded-xl"
                  placeholder="Service price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  className="rounded-xl"
                  placeholder="e.g., 60 min"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={serviceForm.status}
                onValueChange={(value) => setServiceForm({ ...serviceForm, status: value })}
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
            <div className="flex gap-2">
              <Button
                onClick={editingService ? handleEditService : handleAddService}
                disabled={!serviceForm.name || !serviceForm.price || !serviceForm.duration || !serviceForm.category || syncing}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
              >
                {syncing ? 'Saving...' : (editingService ? "Update Service" : "Add Service")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingService(false)
                  setEditingService(null)
                  setServiceForm({ name: "", description: "", price: "", duration: "", category: "", status: "Active" })
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Delete Service
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
                  onClick={() => handleDeleteService(showDeleteDialog.id)}
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
