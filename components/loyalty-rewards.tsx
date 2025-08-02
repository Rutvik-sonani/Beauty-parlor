"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Gift, Star, Plus, Users, TrendingUp, Award } from "lucide-react"

export function LoyaltyRewards() {
  const { customers, loading } = useSupabaseData()

  // Calculate dynamic loyalty statistics
  const loyaltyStats = useMemo(() => {
    const totalCustomers = customers.length
    const bronzeCustomers = customers.filter(c => c.tier === 'Bronze').length
    const silverCustomers = customers.filter(c => c.tier === 'Silver').length
    const goldCustomers = customers.filter(c => c.tier === 'Gold').length
    const platinumCustomers = customers.filter(c => c.tier === 'Platinum').length
    
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0)
    const avgLoyaltyPoints = totalCustomers > 0 ? Math.round(totalLoyaltyPoints / totalCustomers) : 0
    
    const highValueCustomers = customers.filter(c => c.total_spent >= 10000).length
    const activeCustomers = customers.filter(c => c.status === 'Active').length

    return {
      totalCustomers,
      bronzeCustomers,
      silverCustomers,
      goldCustomers,
      platinumCustomers,
      totalLoyaltyPoints,
      avgLoyaltyPoints,
      highValueCustomers,
      activeCustomers
    }
  }, [customers])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-orange-50 border-orange-200 text-orange-700'
      case 'Silver': return 'bg-gray-50 border-gray-200 text-gray-700'
      case 'Gold': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'Platinum': return 'bg-purple-50 border-purple-200 text-purple-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-orange-100 text-orange-700'
      case 'Silver': return 'bg-gray-100 text-gray-700'
      case 'Gold': return 'bg-yellow-100 text-yellow-700'
      case 'Platinum': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTierRange = (tier: string) => {
    switch (tier) {
      case 'Bronze': return '₹0 - ₹5K'
      case 'Silver': return '₹5K - ₹15K'
      case 'Gold': return '₹15K - ₹30K'
      case 'Platinum': return '₹30K+'
      default: return '₹0 - ₹5K'
    }
  }

  const getTierDiscount = (tier: string) => {
    switch (tier) {
      case 'Bronze': return '5% discount on services'
      case 'Silver': return '10% discount + priority booking'
      case 'Gold': return '15% discount + free add-ons'
      case 'Platinum': return '20% discount + VIP treatment'
      default: return '5% discount on services'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Loyalty & Rewards</h1>
            <p className="text-gray-600">Manage customer loyalty programs and rewards</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading loyalty data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Loyalty & Rewards</h1>
          <p className="text-gray-600">Manage customer loyalty programs and rewards</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Create Reward Program
        </Button>
      </div>

      {/* Dynamic Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{loyaltyStats.totalCustomers}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{loyaltyStats.totalLoyaltyPoints.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{loyaltyStats.highValueCustomers}</p>
                <p className="text-sm text-gray-600">High Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{loyaltyStats.avgLoyaltyPoints}</p>
                <p className="text-sm text-gray-600">Avg Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Tier Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => {
                const customerCount = tier === 'Bronze' ? loyaltyStats.bronzeCustomers :
                                    tier === 'Silver' ? loyaltyStats.silverCustomers :
                                    tier === 'Gold' ? loyaltyStats.goldCustomers :
                                    loyaltyStats.platinumCustomers
                
                return (
                  <div key={tier} className={`p-3 rounded-xl border ${getTierColor(tier)}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${getTierColor(tier).split(' ')[3]}`}>{tier}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getTierBadgeColor(tier)}>{getTierRange(tier)}</Badge>
                        <Badge variant="outline" className="text-xs">{customerCount} customers</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{getTierDiscount(tier)}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-600" />
              Reward Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <p className="text-2xl font-bold text-pink-600">1 Point = ₹1</p>
              <p className="text-sm text-gray-600">Earn 1 point for every rupee spent</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total points earned:</span>
                <span className="font-medium">{loyaltyStats.totalLoyaltyPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average per customer:</span>
                <span className="font-medium">{loyaltyStats.avgLoyaltyPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active customers:</span>
                <span className="font-medium">{loyaltyStats.activeCustomers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Minimum redemption:</span>
                <span className="font-medium">100 points</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Points expiry:</span>
                <span className="font-medium">12 months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bonus multiplier:</span>
                <span className="font-medium">2x on birthdays</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Special Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-medium text-green-700">Referral Bonus</h4>
              <p className="text-sm text-gray-600">500 points for each successful referral</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-700">Birthday Special</h4>
              <p className="text-sm text-gray-600">Double points + 20% discount</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-medium text-purple-700">Anniversary Reward</h4>
              <p className="text-sm text-gray-600">Free service on membership anniversary</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
