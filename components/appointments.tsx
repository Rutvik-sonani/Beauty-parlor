"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Phone, Scissors, Edit, Trash2, Check, X } from "lucide-react"

export function Appointments() {
  const { appointments, services, staff, addAppointment, updateAppointment, deleteAppointment, syncing } = useSupabaseData()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [editingAppointment, setEditingAppointment] = useState<number | null>(null)
  const [appointmentForm, setAppointmentForm] = useState({
    customername: '',
    customerphone: '',
    service: '',
    staff: '',
    date: '',
    time: '',
    notes: ''
  })

  // Get current month's calendar data
  const calendarData = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [selectedDate])

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === dateStr)
  }

  // Get today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === today)
  }, [appointments])

  // Get selected date appointments
  const selectedDateAppointments = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === dateStr)
  }, [appointments, selectedDate])

  // Get service price
  const getServicePrice = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName)
    return service?.price || 0
  }

  // Get service duration
  const getServiceDuration = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName)
    return service?.duration || '60 min'
  }

  const handleBookAppointment = async () => {
    if (!appointmentForm.customername || !appointmentForm.customerphone || !appointmentForm.service) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const servicePrice = getServicePrice(appointmentForm.service)
      const serviceDuration = getServiceDuration(appointmentForm.service)
      
      await addAppointment({
        customername: appointmentForm.customername,
        customerphone: appointmentForm.customerphone,
        service: appointmentForm.service,
        staff: appointmentForm.staff,
        date: appointmentForm.date,
        time: appointmentForm.time,
        duration: parseInt(serviceDuration) || 60,
        price: servicePrice,
        status: 'Pending',
        notes: appointmentForm.notes
      })
      
      setAppointmentForm({
        customername: '',
        customerphone: '',
        service: '',
        staff: '',
        date: '',
        time: '',
        notes: ''
      })
      
      toast.success('Appointment booked successfully!')
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Failed to book appointment')
    }
  }

  const handleUpdateAppointment = async (id: number, updates: any) => {
    try {
      await updateAppointment(id, updates)
      setEditingAppointment(null)
      toast.success('Appointment updated successfully!')
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const handleDeleteAppointment = async (id: number) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(id)
        toast.success('Appointment deleted successfully!')
      } catch (error) {
        console.error('Error deleting appointment:', error)
        toast.error('Failed to delete appointment')
      }
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateAppointment(id, { status })
      toast.success(`Appointment ${status.toLowerCase()} successfully!`)
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('Failed to update appointment status')
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600">Manage your salon appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            className="rounded-xl"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="rounded-xl"
          >
            <Clock className="h-4 w-4 mr-2" />
            List
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Book New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input 
                    id="customer" 
                    placeholder="Enter customer name" 
                    className="rounded-xl"
                    value={appointmentForm.customername}
                    onChange={(e) => setAppointmentForm({...appointmentForm, customername: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter phone number" 
                    className="rounded-xl"
                    value={appointmentForm.customerphone}
                    onChange={(e) => setAppointmentForm({...appointmentForm, customerphone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select value={appointmentForm.service} onValueChange={(value) => setAppointmentForm({...appointmentForm, service: value})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.filter(s => s.status === 'Active').map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name} - ₹{service.price} ({service.duration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select value={appointmentForm.staff} onValueChange={(value) => setAppointmentForm({...appointmentForm, staff: value})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.status === 'Active').map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name} - {member.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      className="rounded-xl"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      className="rounded-xl"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any special requirements..." 
                    className="rounded-xl"
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleBookAppointment}
                  disabled={syncing}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                >
                  {syncing ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar View */}
          <Card className="lg:col-span-1 rounded-2xl border-pink-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600" />
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    className="h-8 w-8 p-0"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    className="h-8 w-8 p-0"
                  >
                    ›
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
                  <div>S</div>
                  <div>M</div>
                  <div>T</div>
                  <div>W</div>
                  <div>T</div>
                  <div>F</div>
                  <div>S</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarData.map((date, i) => {
                    const dayAppointments = getAppointmentsForDate(date)
                    const hasAppointments = dayAppointments.length > 0
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          h-10 w-10 text-sm rounded-lg transition-colors relative
                          ${!isCurrentMonth ? "text-gray-300" : "text-gray-700 hover:bg-pink-100"}
                          ${isToday(date) ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white" : ""}
                          ${isSelectedDate(date) && !isToday(date) ? "bg-pink-200 text-pink-800" : ""}
                          ${hasAppointments && !isToday(date) && !isSelectedDate(date) ? "bg-pink-50 text-pink-700" : ""}
                        `}
                      >
                        {date.getDate()}
                        {hasAppointments && (
                          <div className="absolute -top-1 -right-1 h-2 w-2 bg-pink-500 rounded-full"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card className="lg:col-span-3 rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-800">
                Appointments for {formatDate(selectedDate)}
                {selectedDateAppointments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled for {formatDate(selectedDate)}</p>
                    <p className="text-sm">Book an appointment to get started</p>
                  </div>
                ) : (
                  selectedDateAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                            {(appointment.customername || 'Unknown')
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{appointment.customername || 'Unknown Customer'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.customerphone || 'No phone'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Scissors className="h-3 w-3" />
                                {appointment.service || 'No service'}
                              </div>
                              <div className="text-green-600 font-medium">
                                ₹{appointment.price}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                              <Clock className="h-4 w-4" />
                              {appointment.time}
                            </div>
                            <p className="text-xs text-gray-600">{appointment.duration} min</p>
                            <p className="text-xs text-gray-600">with {appointment.staff || 'Unassigned'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                appointment.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                appointment.status === "Confirmed" ? "bg-green-100 text-green-700" :
                                appointment.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                              }
                            >
                              {appointment.status}
                            </Badge>
                            <div className="flex gap-1">
                              {appointment.status === 'Pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange(appointment.id, 'Confirmed')}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingAppointment(appointment.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-white/50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card className="rounded-2xl border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-800">All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled</p>
                  <p className="text-sm">Book your first appointment to get started</p>
                </div>
              ) : (
                appointments
                  .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
                  .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                          {(appointment.customername || 'Unknown')
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{appointment.customername || 'Unknown Customer'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.customerphone || 'No phone'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Scissors className="h-3 w-3" />
                              {appointment.service || 'No service'}
                            </div>
                            <div className="text-green-600 font-medium">
                              ₹{appointment.price}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </div>
                          <p className="text-xs text-gray-600">{appointment.date}</p>
                          <p className="text-xs text-gray-600">with {appointment.staff || 'Unassigned'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              appointment.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                              appointment.status === "Confirmed" ? "bg-green-100 text-green-700" :
                              appointment.status === "Cancelled" ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700"
                            }
                          >
                            {appointment.status}
                          </Badge>
                          <div className="flex gap-1">
                            {appointment.status === 'Pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(appointment.id, 'Confirmed')}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAppointment(appointment.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-white/50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
