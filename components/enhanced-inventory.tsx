"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, AlertTriangle, TrendingDown, TrendingUp, Calendar, Trash2, Edit } from "lucide-react"

export function EnhancedInventory() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Hair Serum",
      sku: "HS001",
      category: "Hair Care",
      quantity: 25,
      minStock: 10,
      price: 850,
      supplier: "Beauty Supplies Co.",
      expiryDate: "2025-06-15",
      lastRestocked: "2024-01-05",
    },
    {
      id: 2,
      name: "Anti-Aging Face Cream",
      sku: "FC002",
      category: "Skin Care",
      quantity: 8,
      minStock: 15,
      price: 1200,
      supplier: "Skincare Solutions",
      expiryDate: "2024-12-20",
      lastRestocked: "2023-12-10",
    },
  ])

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    minStock: "",
    price: "",
    supplier: "",
    expiryDate: "",
  })

  const addProduct = () => {
    if (newProduct.name && newProduct.sku && newProduct.category && newProduct.price) {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          ...newProduct,
          quantity: Number.parseInt(newProduct.quantity) || 0,
          minStock: Number.parseInt(newProduct.minStock) || 5,
          price: Number.parseInt(newProduct.price),
          lastRestocked: new Date().toISOString().split("T")[0],
        },
      ])
      setNewProduct({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        minStock: "",
        price: "",
        supplier: "",
        expiryDate: "",
      })
    }
  }

  const removeProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id))
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock / 2) return { status: "Critical", color: "bg-red-100 text-red-700" }
    if (quantity <= minStock) return { status: "Low", color: "bg-yellow-100 text-yellow-700" }
    return { status: "Good", color: "bg-green-100 text-green-700" }
  }

  const isExpiringSoon = (expiryDate: string) => {
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
          <h1 className="text-3xl font-bold text-gray-800">Enhanced Inventory Management</h1>
          <p className="text-gray-600">Track and manage products with enhanced features</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="Product SKU"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Product category"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    placeholder="Stock quantity"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
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
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newProduct.expiryDate}
                  onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={addProduct}
                disabled={!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.price}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {products.filter((p) => p.quantity <= p.minStock).length}
                </p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {products.filter((p) => isExpiringSoon(p.expiryDate)).length}
                </p>
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
                  ₹{(products.reduce((sum, p) => sum + p.price * p.quantity, 0) / 1000).toFixed(0)}K
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.quantity, product.minStock)
                  const expiringSoon = isExpiringSoon(product.expiryDate)

                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-pink-50/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.supplier}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{product.sku}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="border-pink-200 text-pink-700">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{product.quantity}</span>
                          {product.quantity <= product.minStock && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">₹{product.price}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className={`text-sm ${expiringSoon ? "text-red-600 font-medium" : "text-gray-600"}`}>
                            {new Date(product.expiryDate).toLocaleDateString()}
                          </p>
                          {expiringSoon && <p className="text-xs text-red-500">Expiring Soon</p>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-lg">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeProduct(product.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}
