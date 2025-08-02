"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Ticket, Plus, Calendar, DollarSign, Users, TrendingUp, Award } from "lucide-react"

export function GiftVouchers() {
  const { customers, services, loading } = useSupabaseData()
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: "BEAUTY50",
      type: "Discount",
      value: "50% OFF",
      description: "50% discount on all facial treatments",
      validFrom: "2024-01-01",
      validUntil: "2024-03-31",
      usageLimit: 100,
      usedCount: 45,
      status: "Active",
    },
    {
      id: 2,
      code: "GIFT500",
      type: "Gift Card",
      value: "₹500",
      description: "Gift card worth ₹500 for any service",
      validFrom: "2024-01-15",
      validUntil: "2024-12-31",
      usageLimit: 50,
      usedCount: 12,
      status: "Active",
    },
    {
      id: 3,
      code: "NEWCLIENT",
      type: "Welcome Offer",
      value: "30% OFF",
      description: "Welcome discount for first-time customers",
      validFrom: "2024-01-01",
      validUntil: "2024-06-30",
      usageLimit: 200,
      usedCount: 89,
      status: "Active",
    },
  ])

  // Calculate dynamic promotional statistics
  const promoStats = useMemo(() => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'Active').length
    const highValueCustomers = customers.filter(c => c.total_spent >= 5000).length
    const newCustomers = customers.filter(c => {
      const joinDate = new Date(c.join_date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return joinDate >= thirtyDaysAgo
    }).length

    const totalServices = services.length
    const activeServices = services.filter(s => s.status === 'Active').length
    const avgServicePrice = services.length > 0 ? 
      Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0

    return {
      totalCustomers,
      activeCustomers,
      highValueCustomers,
      newCustomers,
      totalServices,
      activeServices,
      avgServicePrice
    }
  }, [customers, services])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Expired":
        return "bg-red-100 text-red-700"
      case "Draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Gift Card":
        return <Gift className="h-4 w-4" />
      case "Discount":
        return <Ticket className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gift Vouchers & Coupons</h1>
            <p className="text-gray-600">Create and manage promotional offers</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading promotional data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gift Vouchers & Coupons</h1>
          <p className="text-gray-600">Create and manage promotional offers</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Create Voucher
        </Button>
      </div>

      {/* Dynamic Promotional Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{promoStats.totalCustomers}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{promoStats.highValueCustomers}</p>
                <p className="text-sm text-gray-600">High Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{promoStats.newCustomers}</p>
                <p className="text-sm text-gray-600">New Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">₹{promoStats.avgServicePrice}</p>
                <p className="text-sm text-gray-600">Avg Service Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotional Insights */}
      <Card className="rounded-2xl border-pink-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Promotional Insights</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-700 mb-2">Customer Segments</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Active Customers:</span>
                  <span className="font-medium">{promoStats.activeCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Value (₹5K+):</span>
                  <span className="font-medium">{promoStats.highValueCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span>New (30 days):</span>
                  <span className="font-medium">{promoStats.newCustomers}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-medium text-green-700 mb-2">Service Analysis</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Services:</span>
                  <span className="font-medium">{promoStats.totalServices}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Services:</span>
                  <span className="font-medium">{promoStats.activeServices}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Price:</span>
                  <span className="font-medium">₹{promoStats.avgServicePrice}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-medium text-purple-700 mb-2">Promotional Opportunities</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Target New:</span>
                  <span className="font-medium">{promoStats.newCustomers} customers</span>
                </div>
                <div className="flex justify-between">
                  <span>Upsell High Value:</span>
                  <span className="font-medium">{promoStats.highValueCustomers} customers</span>
                </div>
                <div className="flex justify-between">
                  <span>Reactivate:</span>
                  <span className="font-medium">{promoStats.totalCustomers - promoStats.activeCustomers} customers</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher List */}
      <div className="grid gap-4">
        {vouchers.map((voucher) => (
          <Card key={voucher.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white">
                    {getTypeIcon(voucher.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{voucher.code}</h3>
                    <p className="text-gray-600">{voucher.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="border-pink-200 text-pink-700">
                        {voucher.type}
                      </Badge>
                      <span className="text-sm font-medium text-purple-600">{voucher.value}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge className={getStatusColor(voucher.status)}>{voucher.status}</Badge>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Used: {voucher.usedCount}/{voucher.usageLimit}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valid until: {new Date(voucher.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(voucher.usedCount / voucher.usageLimit) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg">
                      Edit
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
