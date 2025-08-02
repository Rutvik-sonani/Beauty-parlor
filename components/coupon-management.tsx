"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Edit, Trash2, Percent, Gift, Calendar, Users } from "lucide-react"

interface Coupon {
  id: number
  code: string
  name: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minAmount: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  validFrom: string
  validTo: string
  isActive: boolean
  applicableServices: string[]
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coupons')
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          code: "WELCOME20",
          name: "Welcome Offer",
          description: "20% off for new customers",
          type: "percentage",
          value: 20,
          minAmount: 500,
          maxDiscount: 500,
          usageLimit: 100,
          usedCount: 25,
          validFrom: "2024-01-01",
          validTo: "2024-12-31",
          isActive: true,
          applicableServices: ["All Services"]
        },
        {
          id: 2,
          code: "HAIR50",
          name: "Hair Care Special",
          description: "₹50 off on hair services",
          type: "fixed",
          value: 50,
          minAmount: 200,
          usageLimit: 50,
          usedCount: 12,
          validFrom: "2024-01-01",
          validTo: "2024-06-30",
          isActive: true,
          applicableServices: ["Hair Care"]
        }
      ]
    }
    return []
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingCoupon, setIsAddingCoupon] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const [couponForm, setCouponForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validTo: "",
    isActive: true,
    applicableServices: ["All Services"]
  })

  const resetForm = () => {
    setCouponForm({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      minAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: "",
      validTo: "",
      isActive: true,
      applicableServices: ["All Services"]
    })
  }

  const handleAddCoupon = () => {
    if (couponForm.code && couponForm.name && couponForm.value) {
      const newCoupon: Coupon = {
        id: Date.now(),
        ...couponForm,
        usedCount: 0
      }
      const updatedCoupons = [newCoupon, ...coupons]
      setCoupons(updatedCoupons)
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons))
      resetForm()
      setIsAddingCoupon(false)
    }
  }

  const handleEditCoupon = () => {
    if (editingCoupon && couponForm.code && couponForm.name && couponForm.value) {
      const updatedCoupons = coupons.map(c => 
        c.id === editingCoupon.id 
          ? { ...c, ...couponForm }
          : c
      )
      setCoupons(updatedCoupons)
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons))
      resetForm()
      setEditingCoupon(null)
    }
  }

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minAmount: coupon.minAmount,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      isActive: coupon.isActive,
      applicableServices: coupon.applicableServices
    })
  }

  const toggleCouponStatus = (id: number) => {
    const updatedCoupons = coupons.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    )
    setCoupons(updatedCoupons)
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons))
  }

  const deleteCoupon = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      const updatedCoupons = coupons.filter(c => c.id !== id)
      setCoupons(updatedCoupons)
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons))
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Coupon Management</h2>
          <p className="text-gray-600">Create and manage discount coupons for your customers</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{coupons.filter(c => c.isActive).length}</p>
                <p className="text-sm text-gray-600">Active Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {coupons.filter(c => c.type === "percentage").length}
                </p>
                <p className="text-sm text-gray-600">Percentage Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {coupons.filter(c => new Date(c.validTo) > new Date()).length}
                </p>
                <p className="text-sm text-gray-600">Valid Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-pink-200"
          />
        </div>
        <Dialog
          open={isAddingCoupon || !!editingCoupon}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingCoupon(false)
              setEditingCoupon(null)
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              onClick={() => setIsAddingCoupon(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <Input
                    id="couponCode"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME20"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponName">Coupon Name</Label>
                  <Input
                    id="couponName"
                    value={couponForm.name}
                    onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                    placeholder="Welcome Offer"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="Describe the coupon offer"
                  className="rounded-xl"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={couponForm.type}
                    onValueChange={(value: "percentage" | "fixed") => setCouponForm({ ...couponForm, type: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">
                    {couponForm.type === "percentage" ? "Percentage" : "Amount"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount (₹)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    value={couponForm.minAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minAmount: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={couponForm.validFrom}
                    onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={couponForm.validTo}
                    onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                {couponForm.type === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={couponForm.maxDiscount}
                      onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={couponForm.isActive}
                  onCheckedChange={(checked) => setCouponForm({ ...couponForm, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingCoupon ? handleEditCoupon : handleAddCoupon}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"
                >
                  {editingCoupon ? "Update Coupon" : "Add Coupon"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingCoupon(false)
                    setEditingCoupon(null)
                    resetForm()
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

      <div className="grid gap-4">
        {filteredCoupons.map((coupon) => (
          <Card key={coupon.id} className="rounded-2xl border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    {coupon.type === "percentage" ? (
                      <Percent className="h-8 w-8 text-purple-600" />
                    ) : (
                      <Gift className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{coupon.code}</h3>
                    <p className="text-gray-600 text-sm">{coupon.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="border-pink-200 text-pink-700">
                        {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Used: {coupon.usedCount}/{coupon.usageLimit}
                      </span>
                      <span className="text-sm text-gray-600">
                        Valid till: {coupon.validTo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className="rounded-lg"
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(coupon)}
                    className="rounded-lg"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCoupon(coupon.id)}
                    className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCoupons.length === 0 && (
          <div className="text-center py-8">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Coupons Found</h3>
            <p className="text-gray-500">Create your first coupon to offer discounts to customers.</p>
          </div>
        )}
      </div>
    </div>
  )
}