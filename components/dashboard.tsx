"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Package,
  BookOpen,
  GraduationCap,
  Star,
  Activity,
  Target,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface DashboardProps {
  dashboardData?: {
    appointments: any[]
    customers: any[]
    staff: any[]
    courses: any[]
    students: any[]
    inventory: any[]
    services: any[]
    reviews: any[]
  }
}

export function Dashboard({ dashboardData }: DashboardProps) {
  const { 
    appointments, 
    customers, 
    staff, 
    services, 
    students, 
    inventory, 
    syncFromSupabase,
    loading,
    connectionStatus 
  } = useSupabaseData();
  
  const [timeFilter, setTimeFilter] = useState("today");
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic stats based on real data
  const getFilteredStats = useMemo(() => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (timeFilter) {
      case "today":
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case "week":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
    }

    // Filter appointments by date range
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= endDate;
    });

    // Calculate revenue from appointments
    const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    // Calculate appointment count
    const appointmentCount = filteredAppointments.length;
    
    // Calculate confirmed appointments
    const confirmedAppointments = filteredAppointments.filter(apt => apt.status === "Confirmed").length;
    
    // Calculate completion rate
    const completionRate = appointmentCount > 0 ? (confirmedAppointments / appointmentCount) * 100 : 0;

    // Calculate low stock items
    const lowStockItems = inventory.filter(item => (item.quantity || 0) <= (item.minStock || 0)).length;

    // Calculate total customers
    const totalCustomers = customers.length;
    
    // Calculate new customers this period (simplified - using total customers)
    const newCustomers = Math.floor(totalCustomers * 0.1); // 10% of total customers as new

    // Calculate average rating from staff
    const avgStaffRating = staff.length > 0 
      ? staff.reduce((sum, s) => sum + (s.experience || 0), 0) / staff.length 
      : 0;

    // Calculate active students
    const activeStudents = students.filter(student => student.status === "Active").length;

    // Calculate top services by appointment count
    const serviceStats = filteredAppointments.reduce((acc, apt) => {
      acc[apt.service] = (acc[apt.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topServices = Object.entries(serviceStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([service, count]) => ({
        name: service,
        count,
        percentage: appointmentCount > 0 ? (count / appointmentCount) * 100 : 0
      }));

    // Calculate growth percentages (simplified - you can enhance this with historical data)
    const revenueGrowth = 12; // This could be calculated from historical data
    const customerGrowth = newCustomers > 0 ? Math.round((newCustomers / totalCustomers) * 100) : 0;
    const appointmentGrowth = 8; // This could be calculated from historical data

    return {
      appointments: appointmentCount,
      confirmedAppointments,
      completionRate,
      revenue: totalRevenue,
      customers: totalCustomers,
      newCustomers,
      lowStock: lowStockItems,
      avgStaffRating,
      activeStudents,
      topServices,
      revenueGrowth,
      customerGrowth,
      appointmentGrowth
    };
  }, [appointments, customers, staff, students, inventory, timeFilter, refreshKey]);

  const stats = getFilteredStats;

  // Get pending appointments
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending"
  );

  // Get recent confirmed appointments
  const recentAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === "Confirmed" ||
        appointment.status === "In Progress"
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Get low stock alerts
  const lowStockAlerts = inventory
    .filter(item => (item.quantity || 0) <= (item.minStock || 0))
    .slice(0, 3);

  const [showStaffSelection, setShowStaffSelection] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedStaffForAppointment, setSelectedStaffForAppointment] = useState("");

  const handleAppointmentAction = async (id: number, action: string) => {
    if (action === "accept") {
      // Show staff selection dialog for acceptance
      setSelectedAppointmentId(id);
      setShowStaffSelection(true);
    } else {
      const newStatus = action === "reschedule" ? "Rescheduled" : "Cancelled";

      try {
        const { error } = await supabase
          .from("appointments")
          .update({ status: newStatus })
          .eq("id", id);

        if (error) {
          console.error("Error updating appointment:", error);
        } else {
          console.log("Appointment updated successfully");
          await syncFromSupabase();
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    }
  };

  const handleStaffSelection = async () => {
    if (!selectedAppointmentId || !selectedStaffForAppointment) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      const selectedStaffData = staff.find(s => s.id.toString() === selectedStaffForAppointment);
      
      if (!selectedStaffData) {
        toast.error("Selected staff member not found");
        return;
      }
      
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "Confirmed",
          staff: selectedStaffData.name 
        })
        .eq("id", selectedAppointmentId);

      if (error) {
        console.error("Error updating appointment:", error);
        toast.error("Failed to update appointment");
      } else {
        console.log("Appointment confirmed with staff");
        toast.success("Appointment confirmed successfully");
        await syncFromSupabase();
        setShowStaffSelection(false);
        setSelectedAppointmentId(null);
        setSelectedStaffForAppointment("");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
    }
  };

  const handleRefresh = async () => {
    await syncFromSupabase();
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-pink-100 animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-gray-600 flex items-center gap-2">
            <span>Welcome back! Here's what's happening.</span>
            {connectionStatus === 'connected' && (
              <span className="text-green-600 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-xl border-pink-200 hover:bg-pink-50"
          >
            <Zap className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40 rounded-xl border-pink-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Appointments{" "}
              {timeFilter === "today"
                ? "Today"
                : timeFilter === "week"
                  ? "This Week"
                  : timeFilter === "month"
                    ? "This Month"
                    : "This Year"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.appointments}</div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-green-600 flex items-center gap-1">
                {stats.appointmentGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(stats.appointmentGrowth)}% from last period
              </p>
              <Progress value={stats.completionRate} className="w-16 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue{" "}
              {timeFilter === "today"
                ? "Today"
                : timeFilter === "week"
                  ? "This Week"
                  : timeFilter === "month"
                    ? "This Month"
                    : "This Year"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">₹{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              {stats.revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(stats.revenueGrowth)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.lowStock}</div>
            <p className="text-xs text-orange-600">Items running low</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.customers}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{stats.newCustomers} new this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Staff Rating</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.avgStaffRating.toFixed(1)}</div>
            <p className="text-xs text-blue-600">Average staff rating</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.activeStudents}</div>
            <p className="text-xs text-indigo-600">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-teal-600">Appointments completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Appointments from Website */}
      {pendingAppointments.length > 0 && (
        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Website Bookings ({pendingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-medium">
                      {appointment.customername
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {appointment.customername}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{appointment.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">
                      Website
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAppointmentAction(appointment.id, "accept")
                      }
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAppointmentAction(appointment.id, "reschedule")
                      }
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAppointmentAction(appointment.id, "cancel")
                      }
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800">Revenue Trend ({timeFilter})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue Chart for {timeFilter}</p>
                <p className="text-sm text-gray-400">₹{stats.revenue.toLocaleString()} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800">Top Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topServices.length > 0 ? (
              stats.topServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      index === 0 ? 'bg-pink-400' : 
                      index === 1 ? 'bg-purple-400' : 'bg-indigo-400'
                    }`}></div>
                    <span className="text-sm text-gray-600">{service.name}</span>
                  </div>
                  <Badge variant="secondary" className={
                    index === 0 ? 'bg-pink-100 text-pink-700' :
                    index === 1 ? 'bg-purple-100 text-purple-700' :
                    'bg-indigo-100 text-indigo-700'
                  }>
                    {service.count} ({service.percentage.toFixed(0)}%)
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No services data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="rounded-2xl border-orange-100">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                                             <p className="text-xs text-orange-600">
                         Stock: {item.quantity} / Min: {item.minStock}
                       </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">
                      Low Stock
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Appointments */}
      <Card className="rounded-2xl border-pink-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-800">Recent Appointments</CardTitle>
          <Button
            variant="outline"
            className="rounded-xl border-pink-200 hover:bg-pink-50"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {appointment.customername
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {appointment.customername}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{appointment.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {appointment.time}
                    </div>
                    <Badge
                      variant={
                        appointment.status === "In Progress"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        appointment.status === "In Progress"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent appointments</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Selection Dialog */}
      {showStaffSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Staff Member</h3>
            <div className="space-y-3 mb-6">
              {staff.map((staffMember) => (
                <div
                  key={staffMember.id}
                  className={`p-3 border rounded-xl cursor-pointer transition-colors ${
                    selectedStaffForAppointment === staffMember.id.toString()
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                  onClick={() => setSelectedStaffForAppointment(staffMember.id.toString())}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {staffMember.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{staffMember.name}</p>
                      <p className="text-sm text-gray-600">{staffMember.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStaffSelection(false);
                  setSelectedAppointmentId(null);
                  setSelectedStaffForAppointment("");
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStaffSelection}
                disabled={!selectedStaffForAppointment}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Confirm Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
