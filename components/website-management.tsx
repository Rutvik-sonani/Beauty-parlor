"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { PaymentSettings } from "@/components/payment-settings"
import { CouponManagement } from "@/components/coupon-management"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, ShoppingBag, Scissors, GraduationCap, TestTube } from "lucide-react"

interface Service {
  id: number
  name: string
  category: string
  duration: string
  price: number
  description: string
  status: "Active" | "Inactive"
  image?: string
}

interface ServiceFormState {
  name: string
  category: string
  duration: string
  price: number
  description: string
  status: "Active" | "Inactive"
  image: string
}

const initialServiceFormState: ServiceFormState = {
  name: "",
  category: "",
  duration: "",
  price: 0,
  description: "",
  status: "Active",
  image: "",
}

export function WebsiteManagement() {
  const {
    services,
    inventory: products,
    courses,
    addService,
    updateService,
    deleteService,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addCourse,
    updateCourse,
    deleteCourse,
    loading,
    syncing,
    syncFromSupabase,
    connectionStatus,
  } = useSupabaseData()

  const [activeTab, setActiveTab] = useState("services")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<Service | null>(null)
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(initialServiceFormState)

  const resetForms = () => {
    setServiceForm(initialServiceFormState)
  }

  const handleAddItem = async () => {
    if (!serviceForm.name || !serviceForm.category || !serviceForm.price) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (activeTab === "services") {
        await addService({
          name: serviceForm.name,
          category: serviceForm.category,
          duration: serviceForm.duration,
          price: serviceForm.price,
          description: serviceForm.description,
          status: serviceForm.status,
        })
      } else if (activeTab === "products") {
        await addInventoryItem({
          name: serviceForm.name,
          category: serviceForm.category,
          price: serviceForm.price,
          stock: parseInt(serviceForm.duration) || 0,
          min_stock: 5,
          supplier: null,
          description: serviceForm.description,
          status: serviceForm.status,
          expiry_date: null,
          last_restocked: new Date().toISOString().split('T')[0]
        })
      } else if (activeTab === "courses") {
        await addCourse({
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price,
          duration: serviceForm.duration,
          max_students: parseInt(serviceForm.category) || 20,
          current_students: 0,
          status: serviceForm.status,
          start_date: null,
          end_date: null,
          schedule: null,
          instructor_id: null
        })
      }
      resetForms()
      setIsAddingItem(false)
      toast.success(`${activeTab.slice(0, -1)} added successfully!`)
    } catch (error) {
      console.error(`Failed to add ${activeTab.slice(0, -1)}:`, error)
      toast.error(`Failed to add ${activeTab.slice(0, -1)}`)
    }
  }

  const handleEditItem = async () => {
    if (!editingItem || !serviceForm.name || !serviceForm.category || !serviceForm.price) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (activeTab === "services") {
        await updateService(editingItem.id, {
          name: serviceForm.name,
          category: serviceForm.category,
          duration: serviceForm.duration,
          price: serviceForm.price,
          description: serviceForm.description,
          status: serviceForm.status,
        })
      } else if (activeTab === "products") {
        await updateInventoryItem(editingItem.id, {
          name: serviceForm.name,
          category: serviceForm.category,
          price: serviceForm.price,
          stock: parseInt(serviceForm.duration) || 0,
          description: serviceForm.description,
          status: serviceForm.status,
        })
      } else if (activeTab === "courses") {
        await updateCourse(editingItem.id, {
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price,
          duration: serviceForm.duration,
          max_students: parseInt(serviceForm.category) || 20,
          status: serviceForm.status,
        })
      }
      resetForms()
      setEditingItem(null)
      toast.success(`${activeTab.slice(0, -1)} updated successfully!`)
    } catch (error) {
      console.error(`Failed to update ${activeTab.slice(0, -1)}:`, error)
      toast.error(`Failed to update ${activeTab.slice(0, -1)}`)
    }
  }

  const startEdit = (item: any, type: string) => {
    setEditingItem(item)
    if (type === "service") {
      setServiceForm({
        name: item.name,
        category: item.category,
        duration: item.duration,
        price: item.price,
        description: item.description,
        status: (item.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
        image: item.image || "",
      })
    } else if (type === "product") {
      setServiceForm({
        name: item.name,
        category: item.category,
        duration: item.stock.toString(),
        price: item.price,
        description: item.description || "",
        status: (item.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
        image: "",
      })
    } else if (type === "course") {
      setServiceForm({
        name: item.name,
        category: item.max_students.toString(),
        duration: item.duration,
        price: item.price,
        description: item.description,
        status: (item.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
        image: "",
      })
    }
  }

  const toggleStatus = async (id: number, currentStatus: string, type: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" as const : "Active" as const
    try {
      if (type === "service") {
        await updateService(id, { status: newStatus })
      } else if (type === "product") {
        await updateInventoryItem(id, { status: newStatus })
      } else if (type === "course") {
        await updateCourse(id, { status: newStatus })
      }
      toast.success(`Status updated successfully!`)
    } catch (error) {
      console.error(`Failed to toggle ${type} status:`, error)
      toast.error(`Failed to update status`)
    }
  }

  const handleDelete = async (id: number, type: string) => {
    try {
      if (type === "service") {
        await deleteService(id)
      } else if (type === "product") {
        await deleteInventoryItem(id)
      } else if (type === "course") {
        await deleteCourse(id)
      }
      toast.success(`${type} deleted successfully!`)
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
      toast.error(`Failed to delete ${type}`)
    }
  }

  const [stats, setStats] = useState({
    services: { total: 0, active: 0 },
    products: { total: 0, active: 0 },
    packages: { total: 0, active: 0 },
    courses: { total: 0, active: 0 },
  })

  useEffect(() => {
    setStats({
      services: {
        total: services.length,
        active: services.filter((s) => s.status === "Active").length,
      },
      products: {
        total: products.length,
        active: products.filter((p) => p.status === "Active").length,
      },
      packages: { total: 0, active: 0 }, // Packages not implemented yet
      courses: {
        total: courses.length,
        active: courses.filter((c) => c.status === "Active").length,
      },
    })
  }, [services, products, courses])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Website Management</h1>
          <p className="text-gray-600">Manage your website content, services, products, and courses</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Scissors className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.services.active}</p>
                <p className="text-sm text-gray-600">Active Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.products.active}</p>
                <p className="text-sm text-gray-600">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.packages.active}</p>
                <p className="text-sm text-gray-600">Active Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.courses.active}</p>
                <p className="text-sm text-gray-600">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-pink-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => syncFromSupabase()}
                disabled={syncing}
                className="rounded-xl"
              >
                {syncing ? "Syncing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const { testRealtimeConnection, addTestService } = await import('@/lib/test-realtime')
                  await testRealtimeConnection()
                  setTimeout(() => addTestService(), 2000)
                }}
                disabled={syncing}
                className="rounded-xl"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Real-time
              </Button>
              <Dialog
                open={isAddingItem || !!editingItem}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingItem(false)
                    setEditingItem(null)
                    resetForms()
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                    onClick={() => setIsAddingItem(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Service" : "Add New Service"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceName">Service Name</Label>
                        <Input
                          id="serviceName"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceCategory">Category</Label>
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
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceDuration">Duration</Label>
                        <Input
                          id="serviceDuration"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          placeholder="e.g., 60 min"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="servicePrice">Price (₹)</Label>
                        <Input
                          id="servicePrice"
                          type="number"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceDescription">Description</Label>
                      <Textarea
                        id="serviceDescription"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="serviceStatus"
                        checked={serviceForm.status === "Active"}
                        onCheckedChange={(checked) =>
                          setServiceForm({ ...serviceForm, status: checked ? "Active" : "Inactive" })
                        }
                      />
                      <Label htmlFor="serviceStatus">Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={editingItem ? handleEditItem : handleAddItem}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                        disabled={syncing}
                      >
                        {syncing ? "Processing..." : (editingItem ? "Update Service" : "Add Service")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingItem(false)
                          setEditingItem(null)
                          resetForms()
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {services.length} service{services.length !== 1 ? 's' : ''} total
              {syncing && <span className="ml-2 text-blue-600">• Syncing...</span>}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-gray-500">
                {connectionStatus === 'connected' ? 'Real-time active' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading services...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {services
                .filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((service) => (
                  <Card key={service.id} className="rounded-2xl border-pink-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <Scissors className="h-8 w-8 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                            <p className="text-gray-600 text-sm">{service.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline" className="border-pink-200 text-pink-700">
                                {service.category}
                              </Badge>
                              <span className="text-sm text-gray-600">₹{service.price}</span>
                              <span className="text-sm text-gray-600">{service.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={service.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {service.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(service.id, service.status, "service")}
                            className="rounded-lg"
                            disabled={syncing}
                          >
                            {service.status === "Active" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(service, "service")}
                            className="rounded-lg"
                            disabled={syncing}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                                disabled={syncing}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the "{service.name}" service.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(service.id, "service")}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {services.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Services Found</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first service to the system.</p>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Service
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-pink-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => syncFromSupabase()}
                disabled={syncing}
                className="rounded-xl"
              >
                {syncing ? "Syncing..." : "Refresh"}
              </Button>
              <Dialog
                open={isAddingItem || !!editingItem}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingItem(false)
                    setEditingItem(null)
                    resetForms()
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                    onClick={() => setIsAddingItem(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Product" : "Add New Product"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productCategory">Category</Label>
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
                            <SelectItem value="Hair Color">Hair Color</SelectItem>
                            <SelectItem value="Makeup">Makeup</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Accessories">Accessories</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productPrice">Price (₹)</Label>
                        <Input
                          id="productPrice"
                          type="number"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productStock">Stock</Label>
                        <Input
                          id="productStock"
                          type="number"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          placeholder="Stock quantity"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productDescription">Description</Label>
                      <Textarea
                        id="productDescription"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="productStatus"
                        checked={serviceForm.status === "Active"}
                        onCheckedChange={(checked) =>
                          setServiceForm({ ...serviceForm, status: checked ? "Active" : "Inactive" })
                        }
                      />
                      <Label htmlFor="productStatus">Active</Label>
                    </div>
                    <div className="flex gap-2">
                                             <Button
                         onClick={editingItem ? handleEditItem : handleAddItem}
                         className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                         disabled={syncing}
                       >
                         {syncing ? "Processing..." : (editingItem ? "Update Product" : "Add Product")}
                       </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingItem(false)
                          setEditingItem(null)
                          resetForms()
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {products.length} product{products.length !== 1 ? 's' : ''} total
              {syncing && <span className="ml-2 text-blue-600">• Syncing...</span>}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-gray-500">
                {connectionStatus === 'connected' ? 'Real-time active' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {products
                .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((product) => (
                  <Card key={product.id} className="rounded-2xl border-pink-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                            <p className="text-gray-600 text-sm">{product.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline" className="border-pink-200 text-pink-700">
                                {product.category}
                              </Badge>
                              <span className="text-sm text-gray-600">₹{product.price}</span>
                              <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={product.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {product.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(product.id, product.status, "product")}
                            className="rounded-lg"
                            disabled={syncing}
                          >
                            {product.status === "Active" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(product, "product")}
                            className="rounded-lg"
                            disabled={syncing}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                                disabled={syncing}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the "{product.name}" product.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id, "product")}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {products.length === 0 && !loading && (
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Products Found</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first product to the system.</p>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Packages management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-pink-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => syncFromSupabase()}
                disabled={syncing}
                className="rounded-xl"
              >
                {syncing ? "Syncing..." : "Refresh"}
              </Button>
              <Dialog
                open={isAddingItem || !!editingItem}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingItem(false)
                    setEditingItem(null)
                    resetForms()
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                    onClick={() => setIsAddingItem(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Course" : "Add New Course"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseName">Course Name</Label>
                        <Input
                          id="courseName"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseDuration">Duration</Label>
                        <Input
                          id="courseDuration"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          placeholder="e.g., 3 months"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coursePrice">Price (₹)</Label>
                        <Input
                          id="coursePrice"
                          type="number"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseMaxStudents">Max Students</Label>
                        <Input
                          id="courseMaxStudents"
                          type="number"
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          placeholder="Maximum students"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseDescription">Description</Label>
                      <Textarea
                        id="courseDescription"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="courseStatus"
                        checked={serviceForm.status === "Active"}
                        onCheckedChange={(checked) =>
                          setServiceForm({ ...serviceForm, status: checked ? "Active" : "Inactive" })
                        }
                      />
                      <Label htmlFor="courseStatus">Active</Label>
                    </div>
                    <div className="flex gap-2">
                                           <Button
                       onClick={editingItem ? handleEditItem : handleAddItem}
                       className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                       disabled={syncing}
                     >
                       {syncing ? "Processing..." : (editingItem ? "Update Course" : "Add Course")}
                     </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingItem(false)
                          setEditingItem(null)
                          resetForms()
                        }}
                        className="flex-1 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {courses.length} course{courses.length !== 1 ? 's' : ''} total
              {syncing && <span className="ml-2 text-blue-600">• Syncing...</span>}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-gray-500">
                {connectionStatus === 'connected' ? 'Real-time active' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading courses...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses
                .filter((course) => course.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((course) => (
                  <Card key={course.id} className="rounded-2xl border-pink-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                            <p className="text-gray-600 text-sm">{course.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-600">₹{course.price}</span>
                              <span className="text-sm text-gray-600">{course.duration}</span>
                              <span className="text-sm text-gray-600">{course.current_students}/{course.max_students} students</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={course.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {course.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(course.id, course.status, "course")}
                            className="rounded-lg"
                            disabled={syncing}
                          >
                            {course.status === "Active" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(course, "course")}
                            className="rounded-lg"
                            disabled={syncing}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                                disabled={syncing}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the "{course.name}" course.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(course.id, "course")}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {courses.length === 0 && !loading && (
                <div className="text-center py-8">
                  <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Found</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first course to the system.</p>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Course
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentSettings />
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <CouponManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}