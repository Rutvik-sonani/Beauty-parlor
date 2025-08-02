"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Search, Filter } from "lucide-react"

interface Booking {
  id: number
  customername: string
  customerphone: string
  customeremail: string
  service: string
  staff: string
  date: string
  time: string
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  notes: string
  source: string
  amount: number
}

export function WebsiteBookings() {
  const { appointments, updateAppointment, addAppointment, loading, syncing, connectionStatus } = useSupabaseData()
  
  const bookings: Booking[] = appointments.map(apt => ({
    id: apt.id,
    customername: apt.customername || 'Unknown',
    customerphone: apt.customerphone || '',
    customerEmail: apt.customerEmail || '',
    service: apt.service || 'Unknown Service',
    staff: apt.staff || 'Unassigned',
    date: apt.date || '',
    time: apt.time || '',
    status: (apt.status || 'Pending') as "Pending" | "Confirmed" | "Cancelled" | "Completed",
    notes: apt.notes || '',
    source: "Website",
    amount: apt.price || 0
  }))

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerphone.includes(searchTerm) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700"
      case "Confirmed": return "bg-green-100 text-green-700"
      case "Cancelled": return "bg-red-100 text-red-700"
      case "Completed": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      if (status === 'Cancelled' || status === 'Completed') {
        // Delete appointment instead of updating status
        const { error } = await supabase.from('appointments').delete().eq('id', id)
        if (error) throw error
      } else {
        await updateAppointment(id, { status })
      }
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Website Bookings</h1>
          <p className="text-gray-600">Manage customer bookings from your website</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await addAppointment({
                customername: 'Test Customer',
                customerphone: '1234567890',
                service: 'Test Service',
                staff: 'Test Staff',
                date: '2024-01-20',
                time: '10:00',
                duration: 60,
                price: 100,
                status: 'Pending',
                notes: 'Test booking'
              })
            }}
            className="text-xs"
          >
            Add Test Booking
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { clearAllAppointments } = await import('@/lib/clear-dummy-data')
              await clearAllAppointments()
              window.location.reload()
            }}
            className="text-xs bg-red-50 text-red-600 hover:bg-red-100"
          >
            Clear All Appointments
          </Button>
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
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {bookings.filter(b => b.status === "Pending").length}
                </p>
                <p className="text-sm text-gray-600">Pending Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {bookings.filter(b => b.status === "Confirmed").length}
                </p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
                </p>
                <p className="text-sm text-gray-600">Today's Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
          {syncing && <span className="ml-2 text-blue-600">• Syncing...</span>}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-pink-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 rounded-xl">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
          <Card key={booking.id} className="rounded-2xl border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{booking.customername}</h3>
                    <p className="text-gray-600 text-sm">{booking.service}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{booking.staff}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <span className="text-lg font-semibold text-purple-600">₹{booking.amount}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Customer Name</p>
                            <p className="text-gray-800">{booking.customername}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Service</p>
                            <p className="text-gray-800">{booking.service}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Phone</p>
                            <p className="text-gray-800">{booking.customerphone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Email</p>
                            <p className="text-gray-800">{booking.customeremail}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Date & Time</p>
                            <p className="text-gray-800">{booking.date} at {booking.time}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Staff</p>
                            <p className="text-gray-800">{booking.staff}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Notes</p>
                          <p className="text-gray-800">{booking.notes || "No notes"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => updateBookingStatus(booking.id, "Confirmed")}
                            className="bg-green-600 hover:bg-green-700 rounded-xl"
                            disabled={syncing}
                          >
                            {syncing ? "Processing..." : "Confirm"}
                          </Button>
                          <Button 
                            onClick={() => updateBookingStatus(booking.id, "Cancelled")}
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                            disabled={syncing}
                          >
                            {syncing ? "Processing..." : "Cancel"}
                          </Button>
                          <Button 
                            onClick={() => updateBookingStatus(booking.id, "Completed")}
                            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                            disabled={syncing}
                          >
                            {syncing ? "Processing..." : "Complete"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">No bookings match your current filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}