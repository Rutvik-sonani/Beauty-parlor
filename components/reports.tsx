"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Calendar,
  Heart,
  Cake,
  Crown,
  Award,
  Target,
  BarChart3,
  PieChart,
} from "lucide-react"
import { useSupabaseData } from "@/contexts/supabase-data-context"

interface RevenueData {
  monthly: Record<string, number>
  yearly: Record<string, number>
  services: Record<string, number>
}

interface ExpenseData {
  category: string
  amount: number
  percentage: number
}

interface CustomerStats {
  total: number
  premium: number
  standard: number
  basic: number
  newThisMonth: number
  retentionRate: number
}

export function Reports() {
  const { customers, appointments, services, loading } = useSupabaseData()

  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState("")
  const [customerFilter, setCustomerFilter] = useState("all")

  // Get current date and calculate date ranges
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Generate year options dynamically
  const yearOptions = useMemo(() => {
    const years = []
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year.toString())
    }
    return years
  }, [currentYear])

  // Calculate date range based on selected period
  const getDateRange = () => {
    const startDate = new Date()
    const endDate = new Date()

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate.setMonth(currentMonth - 1)
        break
      case "quarter":
        startDate.setMonth(currentMonth - 3)
        break
      case "year":
        startDate.setFullYear(currentYear - 1)
        break
      default:
        startDate.setMonth(currentMonth - 1)
    }

    return { startDate, endDate }
  }

  // Calculate revenue data dynamically from appointments
  const revenueData = useMemo((): RevenueData => {
    const { startDate, endDate } = getDateRange()
    
    // Filter appointments within the date range
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= startDate && aptDate <= endDate && apt.status === 'Completed'
    })

    // Calculate monthly revenue
    const monthly: Record<string, number> = {}
    const monthlyNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 0; i < 12; i++) {
      const monthAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === i
      })
      monthly[`${monthlyNames[i]} ${currentYear}`] = monthAppointments.reduce((sum, apt) => sum + apt.price, 0)
    }

    // Calculate yearly revenue
    const yearly: Record<string, number> = {}
    for (let year = currentYear - 3; year <= currentYear; year++) {
      const yearAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getFullYear() === year && apt.status === 'Completed'
      })
      yearly[year.toString()] = yearAppointments.reduce((sum, apt) => sum + apt.price, 0)
    }

    // Calculate service revenue
    const services: Record<string, number> = {}
    filteredAppointments.forEach(apt => {
      const serviceName = apt.service
      services[serviceName] = (services[serviceName] || 0) + apt.price
    })

    return { monthly, yearly, services }
  }, [appointments, selectedPeriod, currentYear])

  // Calculate expense data (simulated based on revenue)
  const expenseData = useMemo((): ExpenseData[] => {
    const totalRevenue = Object.values(revenueData.monthly).reduce((sum, amount) => sum + amount, 0)
    const totalExpenses = totalRevenue * 0.65 // Assume 65% of revenue goes to expenses

    return [
      { category: "Staff Salaries", amount: Math.round(totalExpenses * 0.4), percentage: 40 },
      { category: "Products & Supplies", amount: Math.round(totalExpenses * 0.2), percentage: 20 },
      { category: "Rent & Utilities", amount: Math.round(totalExpenses * 0.15), percentage: 15 },
      { category: "Marketing", amount: Math.round(totalExpenses * 0.1), percentage: 10 },
      { category: "Equipment", amount: Math.round(totalExpenses * 0.075), percentage: 7.5 },
      { category: "Others", amount: Math.round(totalExpenses * 0.075), percentage: 7.5 },
    ]
  }, [revenueData])

  // Calculate customer statistics
  const customerStats = useMemo((): CustomerStats => {
    const total = customers.length
    
    // Calculate spending levels
    const premium = customers.filter(c => (c.total_spent || 0) >= 25000).length
    const standard = customers.filter(c => (c.total_spent || 0) >= 10000 && (c.total_spent || 0) < 25000).length
    const basic = customers.filter(c => (c.total_spent || 0) < 10000).length

    // Calculate new customers this month
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const newThisMonth = customers.filter(c => {
      const joinDate = new Date(c.join_date)
      return joinDate >= lastMonth
    }).length

    // Calculate retention rate (customers with visits in last 3 months)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const activeCustomers = customers.filter(c => {
      if (!c.last_visit) return false
      const lastVisit = new Date(c.last_visit)
      return lastVisit >= threeMonthsAgo
    }).length
    const retentionRate = total > 0 ? Math.round((activeCustomers / total) * 100) : 0

    return {
      total,
      premium,
      standard,
      basic,
      newThisMonth,
      retentionRate
    }
  }, [customers])

  // Get customers with birthdays today
  const getTodayBirthdayCustomers = () => {
    return customers.filter((customer) => {
      if (!customer.birthday) return false
      const birthDate = new Date(customer.birthday)
      const todayMonth = today.getMonth() + 1
      const todayDay = today.getDate()
      const birthMonth = birthDate.getMonth() + 1
      const birthDay = birthDate.getDate()
      return birthMonth === todayMonth && birthDay === todayDay
    })
  }

  // Get customers with upcoming birthdays (next 7 days)
  const getUpcomingBirthdays = () => {
    const upcoming = []
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + i)
      
      const dayCustomers = customers.filter(customer => {
        if (!customer.birthday) return false
        const birthDate = new Date(customer.birthday)
        return birthDate.getMonth() === futureDate.getMonth() && birthDate.getDate() === futureDate.getDate()
      })
      
      if (dayCustomers.length > 0) {
        upcoming.push({
          date: futureDate,
          customers: dayCustomers
        })
      }
    }
    return upcoming
  }

  // Get customers by spending levels
  const getCustomersBySpendingLevel = () => {
    const sortedCustomers = [...customers].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))

    const premium = sortedCustomers.filter((c) => (c.total_spent || 0) >= 25000)
    const standard = sortedCustomers.filter((c) => (c.total_spent || 0) >= 10000 && (c.total_spent || 0) < 25000)
    const basic = sortedCustomers.filter((c) => (c.total_spent || 0) < 10000)

    return { premium, standard, basic }
  }

  // Get filtered customers
  const getFilteredCustomers = () => {
    const { premium, standard, basic } = getCustomersBySpendingLevel()

    switch (customerFilter) {
      case "premium":
        return premium
      case "standard":
        return standard
      case "basic":
        return basic
      default:
        return customers
    }
  }

  const filteredCustomers = getFilteredCustomers().filter(
    (customer) => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm),
  )

  const todayBirthdays = getTodayBirthdayCustomers()
  const upcomingBirthdays = getUpcomingBirthdays()
  const { premium, standard, basic } = getCustomersBySpendingLevel()

  const totalRevenue = Object.values(revenueData.monthly).reduce((sum, amount) => sum + amount, 0)
  const totalExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0)
  const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : "0.0"

  // Calculate growth percentage
  const calculateGrowth = () => {
    const { startDate, endDate } = getDateRange()
    const previousStartDate = new Date(startDate)
    const previousEndDate = new Date(endDate)
    
    // Calculate previous period
    const periodDiff = endDate.getTime() - startDate.getTime()
    previousStartDate.setTime(previousStartDate.getTime() - periodDiff)
    previousEndDate.setTime(previousEndDate.getTime() - periodDiff)
    
    const currentPeriodRevenue = appointments
      .filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= startDate && aptDate <= endDate && apt.status === 'Completed'
      })
      .reduce((sum, apt) => sum + apt.price, 0)
    
    const previousPeriodRevenue = appointments
      .filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= previousStartDate && aptDate <= previousEndDate && apt.status === 'Completed'
      })
      .reduce((sum, apt) => sum + apt.price, 0)
    
    if (previousPeriodRevenue === 0) return 0
    return Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
  }

  const revenueGrowth = calculateGrowth()

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-700"
      case "Gold":
        return "bg-yellow-100 text-yellow-700"
      case "Silver":
        return "bg-gray-100 text-gray-700"
      case "Bronze":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSpendingLevelColor = (level: string) => {
    switch (level) {
      case "premium":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "standard":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "basic":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSpendingLevelIcon = (level: string) => {
    switch (level) {
      case "premium":
        return <Crown className="h-4 w-4" />
      case "standard":
        return <Award className="h-4 w-4" />
      case "basic":
        return <Target className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  // Export functionality
  const exportData = () => {
    const data = {
      revenue: revenueData,
      expenses: expenseData,
      customers: customerStats,
      period: selectedPeriod,
      year: selectedYear,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beauty-parlor-report-${selectedPeriod}-${selectedYear}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-600">Loading business insights...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-pink-100">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and special occasions tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 rounded-xl border-pink-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="special-dates">Special Dates</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-pink-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="h-3 w-3" />
                      {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% vs last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{customerStats.total}</p>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {customerStats.retentionRate}% retention rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Cake className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{todayBirthdays.length}</p>
                    <p className="text-sm text-gray-600">Birthdays Today</p>
                    <p className="text-xs text-purple-600">Send wishes!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{customerStats.newThisMonth}</p>
                    <p className="text-sm text-gray-600">New This Month</p>
                    <p className="text-xs text-green-600">Growing customer base!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(revenueData.monthly).map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-green-600 text-sm">₹{(amount / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Customer Spending Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Premium Customers</span>
                        <p className="text-xs text-gray-500">₹25K+ spent</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">{premium.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Standard Customers</span>
                        <p className="text-xs text-gray-500">₹10K-25K spent</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">{standard.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Basic Customers</span>
                        <p className="text-xs text-gray-500">Below ₹10K spent</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{basic.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="special-dates" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Today's Birthdays */}
            <Card className="rounded-2xl border-purple-100">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Cake className="h-5 w-5 text-purple-600" />
                  Today's Birthdays ({todayBirthdays.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayBirthdays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Cake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No birthdays today</p>
                    <p className="text-sm">Check back tomorrow!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayBirthdays.map((customer) => (
                      <div key={customer.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800">{customer.name}</h4>
                            <Badge className={getTierColor(customer.tier)}>{customer.tier}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Age: {customer.birthday ? today.getFullYear() - new Date(customer.birthday).getFullYear() : 'N/A'}</span>
                            <span>Total Spent: ₹{(customer.total_spent || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-2xl">🎂</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Birthdays */}
            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600" />
                  Upcoming Birthdays (Next 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBirthdays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming birthdays</p>
                    <p className="text-sm">Next 7 days are clear!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBirthdays.map((day, index) => (
                      <div key={index} className="p-3 bg-pink-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-pink-600" />
                          <span className="font-medium text-gray-700">
                            {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <Badge className="bg-pink-100 text-pink-700">{day.customers.length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {day.customers.map((customer) => (
                            <div key={customer.id} className="flex items-center gap-2 text-sm">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                                  {customer.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-700">{customer.name}</span>
                              <Badge className={getTierColor(customer.tier)}>{customer.tier}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-pink-200"
              />
            </div>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="premium">Premium (₹25K+)</SelectItem>
                <SelectItem value="standard">Standard (₹10K-25K)</SelectItem>
                <SelectItem value="basic">Basic (Below ₹10K)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Level Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{premium.length}</p>
                    <p className="text-sm text-gray-600">Premium Customers</p>
                    <p className="text-xs text-purple-600">₹25,000+ spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{standard.length}</p>
                    <p className="text-sm text-gray-600">Standard Customers</p>
                    <p className="text-xs text-blue-600">₹10,000-25,000 spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{basic.length}</p>
                    <p className="text-sm text-gray-600">Basic Customers</p>
                    <p className="text-xs text-green-600">Below ₹10,000 spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => {
              // Determine spending level
              const totalSpent = customer.total_spent || 0
              let spendingLevel = "basic"
              if (totalSpent >= 25000) spendingLevel = "premium"
              else if (totalSpent >= 10000) spendingLevel = "standard"

              return (
                <Card key={customer.id} className="rounded-2xl border-pink-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{customer.name}</h4>
                          <Badge className={getTierColor(customer.tier)}>{customer.tier}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSpendingLevelColor(spendingLevel)}>
                            {getSpendingLevelIcon(spendingLevel)}
                            <span className="ml-1 capitalize">{spendingLevel}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Total Spent:</span>
                            <span className="font-medium text-green-600">₹{totalSpent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Visits:</span>
                            <span className="font-medium">{customer.total_visits || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Birthday:</span>
                            <span className="font-medium">{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Status:</span>
                            <Badge
                              className={
                                customer.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }
                            >
                              {customer.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(revenueData.monthly).map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center p-2 hover:bg-pink-50 rounded-lg">
                      <span className="text-sm text-gray-600">{month}</span>
                      <span className="font-semibold text-green-600">₹{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-800">Service Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(revenueData.services).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No service revenue data</p>
                    <p className="text-sm">Complete some appointments to see revenue breakdown</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(revenueData.services).map(([service, amount]) => (
                      <div key={service} className="flex justify-between items-center p-2 hover:bg-purple-50 rounded-lg">
                        <span className="text-sm text-gray-600">{service}</span>
                        <span className="font-semibold text-purple-600">₹{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Yearly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {Object.entries(revenueData.yearly).map(([year, amount]) => (
                  <div key={year} className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-800">₹{(amount / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-gray-600">{year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Monthly Expenses Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseData.map((expense, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{expense.category}</span>
                      <span className="text-sm font-semibold text-red-600">₹{expense.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${expense.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{expense.percentage}% of total expenses</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Monthly Expenses:</span>
                  <span className="text-lg font-bold text-red-600">₹{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-gray-700">Profit Margin:</span>
                  <span className="text-lg font-bold text-green-600">{profitMargin}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
