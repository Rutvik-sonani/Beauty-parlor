"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageSquare, Plus, Users, TrendingUp, Send, Calendar, Target, Trash2, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface MarketingCampaign {
  id: number
  name: string
  type: string
  status: string
  sent: number
  responses: number
  response_rate: number
  message: string
  target_audience: string
  scheduled_date: string | null
  created_at: string
  updated_at: string
}

interface MarketingStats {
  emails_sent: number
  sms_sent: number
  open_rate: number
  new_customers: number
  total_revenue: number
  new_bookings: number
  average_response_rate: number
}

export function Marketing() {
  const { customers, appointments, loading } = useSupabaseData()
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [stats, setStats] = useState<MarketingStats>({
    emails_sent: 0,
    sms_sent: 0,
    open_rate: 0,
    new_customers: 0,
    total_revenue: 0,
    new_bookings: 0,
    average_response_rate: 0
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "",
    message: "",
    targetAudience: "",
    scheduledDate: "",
  })

  // Fetch campaigns from database
  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to fetch campaigns')
    }
  }

  // Calculate marketing stats dynamically
  const calculateStats = () => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    // Calculate new customers (joined in last 30 days)
    const newCustomers = customers.filter(customer => {
      const joinDate = new Date(customer.join_date)
      return joinDate >= lastMonth
    }).length

    // Calculate new bookings (appointments in last 30 days)
    const newBookings = appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= lastMonth && apt.status === 'Confirmed'
    }).length

    // Calculate total revenue from appointments
    const totalRevenue = appointments
      .filter(apt => apt.status === 'Completed')
      .reduce((sum, apt) => sum + apt.price, 0)

    // Calculate average response rate from campaigns
    const avgResponseRate = campaigns.length > 0 
      ? campaigns.reduce((sum, campaign) => sum + campaign.response_rate, 0) / campaigns.length
      : 0

    // Simulate email/SMS stats based on campaigns
    const emailsSent = campaigns
      .filter(c => c.type.includes('Email'))
      .reduce((sum, c) => sum + c.sent, 0)
    
    const smsSent = campaigns
      .filter(c => c.type.includes('SMS'))
      .reduce((sum, c) => sum + c.sent, 0)

    // Simulate open rate based on responses
    const totalSent = emailsSent + smsSent
    const totalResponses = campaigns.reduce((sum, c) => sum + c.responses, 0)
    const openRate = totalSent > 0 ? (totalResponses / totalSent) * 100 : 0

    setStats({
      emails_sent: emailsSent,
      sms_sent: smsSent,
      open_rate: Math.round(openRate * 10) / 10,
      new_customers: newCustomers,
      total_revenue: totalRevenue,
      new_bookings: newBookings,
      average_response_rate: Math.round(avgResponseRate * 10) / 10
    })
  }

  // Create or update campaign
  const saveCampaign = async () => {
    try {
      const campaignData = {
        name: newCampaign.name,
        type: newCampaign.type,
        message: newCampaign.message,
        target_audience: newCampaign.targetAudience,
        scheduled_date: newCampaign.scheduledDate || null,
        status: newCampaign.scheduledDate ? 'Scheduled' : 'Active',
        sent: 0,
        responses: 0,
        response_rate: 0
      }

      if (editingCampaign) {
        // Update existing campaign
        const { error } = await supabase
          .from('marketing_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id)

        if (error) throw error
        toast.success('Campaign updated successfully')
        setEditingCampaign(null)
      } else {
        // Create new campaign
        const { error } = await supabase
          .from('marketing_campaigns')
          .insert([campaignData])

        if (error) throw error
        toast.success('Campaign created successfully')
      }

      // Reset form
      setNewCampaign({
        name: "",
        type: "",
        message: "",
        targetAudience: "",
        scheduledDate: "",
      })
      setShowCreateForm(false)
      
      // Refresh campaigns
      await fetchCampaigns()
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast.error('Failed to save campaign')
    }
  }

  // Delete campaign
  const deleteCampaign = async (id: number) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Campaign deleted successfully')
      await fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  // Edit campaign
  const editCampaign = (campaign: MarketingCampaign) => {
    setEditingCampaign(campaign)
    setNewCampaign({
      name: campaign.name,
      type: campaign.type,
      message: campaign.message,
      targetAudience: campaign.target_audience,
      scheduledDate: campaign.scheduled_date || "",
    })
    setShowCreateForm(true)
  }

  // Send campaign
  const sendCampaign = async (campaign: MarketingCampaign) => {
    try {
      // Simulate sending campaign
      const targetCustomers = getTargetCustomers(campaign.target_audience)
      const sentCount = targetCustomers.length
      
      // Update campaign with sent count
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ 
          sent: sentCount,
          status: 'Active',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id)

      if (error) throw error
      
      toast.success(`Campaign sent to ${sentCount} customers`)
      await fetchCampaigns()
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    }
  }

  // Get target customers based on audience selection
  const getTargetCustomers = (targetAudience: string) => {
    switch (targetAudience) {
      case 'all':
        return customers
      case 'new':
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        return customers.filter(c => new Date(c.join_date) >= lastMonth)
      case 'regular':
        return customers.filter(c => c.total_visits >= 5)
      case 'inactive':
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return customers.filter(c => 
          !c.last_visit || new Date(c.last_visit) < threeMonthsAgo
        )
      case 'birthday':
        const currentMonth = new Date().getMonth()
        return customers.filter(c => {
          if (!c.birthday) return false
          const birthdayMonth = new Date(c.birthday).getMonth()
          return birthdayMonth === currentMonth
        })
      default:
        return customers
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Recalculate stats when data changes
  useEffect(() => {
    if (!loading) {
      calculateStats()
    }
  }, [customers, appointments, campaigns, loading])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Marketing & Engagement</h1>
          <p className="text-gray-600">Manage campaigns and customer engagement</p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateForm(true)
            setEditingCampaign(null)
            setNewCampaign({
              name: "",
              type: "",
              message: "",
              targetAudience: "",
              scheduledDate: "",
            })
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Marketing Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.emails_sent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.sms_sent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">SMS Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.open_rate}%</p>
                <p className="text-sm text-gray-600">Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.new_customers}</p>
                <p className="text-sm text-gray-600">New Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campaign Management */}
        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No campaigns yet. Create your first campaign to get started!</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{campaign.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${
                          campaign.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "Scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {campaign.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editCampaign(campaign)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{campaign.message}</p>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      Sent: {campaign.sent} | Type: {campaign.type}
                    </span>
                    <span>Response: {campaign.response_rate}%</span>
                  </div>
                  {campaign.status === 'Scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => sendCampaign(campaign)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      <Send className="h-3 w-3 mr-2" />
                      Send Now
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Campaign Form */}
        {showCreateForm && (
          <Card className="rounded-2xl border-purple-100">
            <CardHeader>
              <CardTitle className="text-gray-800">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email Only</SelectItem>
                    <SelectItem value="SMS">SMS Only</SelectItem>
                    <SelectItem value="Email + SMS">Email + SMS</SelectItem>
                    <SelectItem value="Automated">Automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select
                  value={newCampaign.targetAudience}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, targetAudience: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers ({customers.length})</SelectItem>
                    <SelectItem value="new">New Customers ({customers.filter(c => {
                      const lastMonth = new Date()
                      lastMonth.setMonth(lastMonth.getMonth() - 1)
                      return new Date(c.join_date) >= lastMonth
                    }).length})</SelectItem>
                    <SelectItem value="regular">Regular Customers ({customers.filter(c => c.total_visits >= 5).length})</SelectItem>
                    <SelectItem value="inactive">Inactive Customers ({customers.filter(c => {
                      const threeMonthsAgo = new Date()
                      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
                      return !c.last_visit || new Date(c.last_visit) < threeMonthsAgo
                    }).length})</SelectItem>
                    <SelectItem value="birthday">Birthday This Month ({customers.filter(c => {
                      if (!c.birthday) return false
                      const currentMonth = new Date().getMonth()
                      const birthdayMonth = new Date(c.birthday).getMonth()
                      return birthdayMonth === currentMonth
                    }).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-message">Message</Label>
                <Textarea
                  id="campaign-message"
                  placeholder="Enter your campaign message"
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Schedule Date (Optional)</Label>
                <Input
                  id="scheduled-date"
                  type="datetime-local"
                  value={newCampaign.scheduledDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveCampaign}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingCampaign(null)
                  }}
                  className="flex-1 rounded-xl border-pink-200 hover:bg-pink-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Campaign Performance */}
      <Card className="rounded-2xl border-indigo-100">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{stats.average_response_rate}%</p>
              <p className="text-sm text-gray-600">Average Response Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">₹{stats.total_revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Revenue Generated</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{stats.new_bookings}</p>
              <p className="text-sm text-gray-600">New Bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
