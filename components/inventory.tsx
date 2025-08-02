"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Plus, AlertTriangle, TrendingDown, TrendingUp, Calendar, Edit, Filter, RefreshCw, Trash2, AlertCircle } from "lucide-react"

interface InventoryItem {
  id: number
  name: string
  category: string
  price: number
  stock: number
  min_stock: number
  supplier: string | null
  description: string | null
  status: string
  expiry_date: string | null
  last_restocked: string | null
  created_at: string
  updated_at: string
}

export function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, syncing } = useSupabaseData()
  
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null)
  const [restockingProduct, setRestockingProduct] = useState<InventoryItem | null>(null)
  const [showLowStockAlert, setShowLowStockAlert] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<InventoryItem | null>(null)
  const [filterCategory, setFilterCategory] = useState("all")
  const [restockQuantity, setRestockQuantity] = useState("")

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    stock: "",
    min_stock: "",
    price: "",
    supplier: "",
    description: "",
    expiry_date: "",
    status: "Active"
  })

  // Calculate dynamic statistics
  const stats = useMemo(() => {
    const activeProducts = inventory.filter(p => p.status === 'Active')
    const lowStockProducts = activeProducts.filter(p => p.stock <= p.min_stock)
    const expiringProducts = activeProducts.filter(p => p.expiry_date && isExpiringSoon(p.expiry_date))
    const totalValue = activeProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)

    return {
      totalProducts: activeProducts.length,
      lowStockItems: lowStockProducts.length,
      expiringSoon: expiringProducts.length,
      inventoryValue: totalValue
    }
  }, [inventory])

  // Filter products
  const filteredProducts = useMemo(() => {
    return inventory.filter((product) => {
      const categoryMatch = filterCategory === "all" || product.category === filterCategory
      const statusMatch = product.status === 'Active'
      return categoryMatch && statusMatch
    })
  }, [inventory, filterCategory])

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    return [...new Set(inventory.filter(p => p.status === 'Active').map((p) => p.category))]
  }, [inventory])

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await addInventoryItem({
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price) || 0,
        stock: parseInt(newProduct.stock) || 0,
        min_stock: parseInt(newProduct.min_stock) || 5,
        supplier: newProduct.supplier || null,
        description: newProduct.description || null,
        status: newProduct.status,
        expiry_date: newProduct.expiry_date || null,
        last_restocked: new Date().toISOString().split('T')[0]
      })
      
      setNewProduct({
        name: "",
        category: "",
        stock: "",
        min_stock: "",
        price: "",
        supplier: "",
        description: "",
        expiry_date: "",
        status: "Active"
      })
      setShowAddDialog(false)
      toast.success('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    }
  }

  const updateProduct = async () => {
    if (!editingProduct) return

    try {
      await updateInventoryItem(editingProduct.id, {
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
        min_stock: editingProduct.min_stock,
        supplier: editingProduct.supplier,
        description: editingProduct.description,
        status: editingProduct.status,
        expiry_date: editingProduct.expiry_date
      })
      
      setEditingProduct(null)
      toast.success('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const restockProduct = async () => {
    if (!restockingProduct || !restockQuantity) return

    try {
      const quantity = parseInt(restockQuantity)
      await updateInventoryItem(restockingProduct.id, {
        stock: restockingProduct.stock + quantity,
        last_restocked: new Date().toISOString().split('T')[0]
      })
      
      setRestockingProduct(null)
      setRestockQuantity("")
      toast.success('Product restocked successfully!')
    } catch (error) {
      console.error('Error restocking product:', error)
      toast.error('Failed to restock product')
    }
  }

  const deleteProduct = async (productId: number) => {
    try {
      await deleteInventoryItem(productId)
      setShowDeleteDialog(null)
      toast.success('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock / 2) return { status: "Critical", color: "bg-red-100 text-red-700" }
    if (quantity <= minStock) return { status: "Low", color: "bg-yellow-100 text-yellow-700" }
    return { status: "Good", color: "bg-green-100 text-green-700" }
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 // Expiring within 3 months
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLowStockAlert(true)}
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock Alert ({stats.lowStockItems})
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filter by Category" />
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

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-red-100 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.lowStockItems}</p>
                <p className="text-sm text-gray-600">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.expiringSoon}</p>
                <p className="text-sm text-gray-600">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{(stats.inventoryValue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Inventory Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card className="rounded-2xl border-pink-100">
        <CardHeader>
          <CardTitle className="text-gray-800">Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">Add your first product to get started</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Expiry</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.min_stock)
                    const expiringSoon = isExpiringSoon(product.expiry_date)

                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-pink-50/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.supplier || 'No supplier'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="border-pink-200 text-pink-700">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{product.stock}</span>
                            {product.stock <= product.min_stock && <TrendingDown className="h-4 w-4 text-red-500" />}
                          </div>
                          <p className="text-xs text-gray-500">Min: {product.min_stock}</p>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800">₹{product.price}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`text-sm ${expiringSoon ? "text-red-600 font-medium" : "text-gray-600"}`}>
                              {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : 'No expiry'}
                            </p>
                            {expiringSoon && <p className="text-xs text-red-500">Expiring Soon</p>}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProduct({ ...product })}
                              className="rounded-lg"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRestockingProduct(product)}
                              className="text-green-600 border-green-200 hover:bg-green-50 rounded-lg"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowDeleteDialog(product)}
                              className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="Stock quantity"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Min Stock</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={newProduct.min_stock}
                  onChange={(e) => setNewProduct({ ...newProduct, min_stock: e.target.value })}
                  placeholder="Minimum stock"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Product price"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                placeholder="Supplier name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Product description"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={newProduct.expiry_date}
                onChange={(e) => setNewProduct({ ...newProduct, expiry_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={addProduct}
              disabled={!newProduct.name || !newProduct.category || !newProduct.price || syncing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              {syncing ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Product Name</Label>
                <Input
                  id="editName"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={editingProduct.category}
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStock">Stock</Label>
                  <Input
                    id="editStock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMinStock">Min Stock</Label>
                  <Input
                    id="editMinStock"
                    type="number"
                    value={editingProduct.min_stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, min_stock: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPrice">Price (₹)</Label>
                <Input
                  id="editPrice"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplier">Supplier</Label>
                <Input
                  id="editSupplier"
                  value={editingProduct.supplier || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editExpiry">Expiry Date</Label>
                <Input
                  id="editExpiry"
                  type="date"
                  value={editingProduct.expiry_date || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, expiry_date: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={updateProduct}
                disabled={syncing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {syncing ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!restockingProduct} onOpenChange={() => setRestockingProduct(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Restock Product</DialogTitle>
          </DialogHeader>
          {restockingProduct && (
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-800">{restockingProduct.name}</h4>
                <p className="text-sm text-gray-600">Category: {restockingProduct.category}</p>
                <p className="text-sm text-gray-600">Current Stock: {restockingProduct.stock}</p>
                <p className="text-sm text-gray-600">Minimum Stock: {restockingProduct.min_stock}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restockQty">Restock Quantity</Label>
                <Input
                  id="restockQty"
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                  className="rounded-xl"
                />
              </div>

              {restockQuantity && (
                <div className="bg-green-50 p-3 rounded-xl">
                  <p className="text-sm text-green-700">
                    New Stock Level: {restockingProduct.stock + parseInt(restockQuantity || '0')}
                  </p>
                </div>
              )}

              <Button
                onClick={restockProduct}
                disabled={!restockQuantity || parseInt(restockQuantity) <= 0 || syncing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {syncing ? 'Restocking...' : 'Restock Product'}
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
              Delete Product
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
                  onClick={() => deleteProduct(showDeleteDialog.id)}
                  disabled={syncing}
                >
                  {syncing ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Low Stock Alert Dialog */}
      <Dialog open={showLowStockAlert} onOpenChange={setShowLowStockAlert}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {stats.lowStockItems === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">All products are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.filter(p => p.stock <= p.min_stock).map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.min_stock)
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200"
                    >
                      <div>
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600">Category: {product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                          <span className="text-sm text-gray-600">
                            Stock: {product.stock} / Min: {product.min_stock}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setRestockingProduct(product)
                          setShowLowStockAlert(false)
                        }}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Restock
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
