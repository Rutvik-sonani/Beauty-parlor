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
import { Clock, Plus, Phone, Scissors, Check, X, RotateCcw, Trash2 } from "lucide-react"

export function EnhancedAppointments() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      customer: "Sarah Johnson",
      phone: "+1 234-567-8901",
      whatsapp: "+1 234-567-8901",
      age: 28,
      service: "Hair Cut & Color",
      staff: "Emma Wilson",
      time: "10:00 AM",
      date: "2024-01-15",
      duration: "2 hours",
      status: "Pending",
      source: "Online",
      notes: "First time customer, prefers natural colors",
    },
    {
      id: 2,
      customer: "Emily Davis",
      phone: "+1 234-567-8902",
      whatsapp: "+1 234-567-8902",
      age: 32,
      service: "Facial Treatment",
      staff: "Sophia Brown",
      time: "11:30 AM",
      date: "2024-01-15",
      duration: "1.5 hours",
      status: "Confirmed",
      source: "Online",
      notes: "Sensitive skin, use gentle products",
    },
    {
      id: 3,
      customer: "Jessica Wilson",
      phone: "+1 234-567-8903",
      whatsapp: "+1 234-567-8903",
      age: 25,
      service: "Manicure & Pedicure",
      staff: "Olivia Taylor",
      time: "2:00 PM",
      date: "2024-01-15",
      duration: "1 hour",
      status: "Confirmed",
      source: "Walk-in",
      notes: "Regular customer, prefers French tips",
    },
  ])

  const [services, setServices] = useState([
    { id: 1, name: "Hair Cut & Style", price: 1200, duration: "60 min" },
    { id: 2, name: "Facial Treatment", price: 1800, duration: "90 min" },
    { id: 3, name: "Manicure & Pedicure", price: 1000, duration: "75 min" },
    { id: 4, name: "Body Massage", price: 2500, duration: "120 min" },
  ])

  const [staff, setStaff] = useState([
    { id: 1, name: "Emma Wilson", role: "Senior Hair Stylist" },
    { id: 2, name: "Sophia Brown", role: "Facial Specialist" },
    { id: 3, name: "Olivia Taylor", role: "Nail Technician" },
    { id: 4, name: "Isabella Garcia", role: "Massage Therapist" },
  ])

  const [newService, setNewService] = useState({ name: "", price: "", duration: "" })
  const [newStaff, setNewStaff] = useState({ name: "", role: "" })

  const updateAppointmentStatus = (id: number, status: string) => {
    setAppointments(appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt)))
  }

  const deleteAppointment = (id: number) => {
    setAppointments(appointments.filter((apt) => apt.id !== id))
  }

  const addService = () => {
    if (newService.name && newService.price && newService.duration) {
      setServices([
        ...services,
        {
          id: services.length + 1,
          name: newService.name,
          price: Number.parseInt(newService.price),
          duration: newService.duration,
        },
      ])
      setNewService({ name: "", price: "", duration: "" })
    }
  }

  const removeService = (id: number) => {
    setServices(services.filter((service) => service.id !== id))
  }

  const addStaff = () => {
    if (newStaff.name && newStaff.role) {
      setStaff([
        ...staff,
        {
          id: staff.length + 1,
          name: newStaff.name,
          role: newStaff.role,
        },
      ])
      setNewStaff({ name: "", role: "" })
    }
  }

  const removeStaff = (id: number) => {
    setStaff(staff.filter((member) => member.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Completed":
        return "bg-blue-100 text-blue-700"
      case "Cancelled":
        return "bg-red-100 text-red-700"
      case "Rescheduled":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Enhanced Appointments</h1>
          <p className="text-gray-600">Manage appointments with online booking integration</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-pink-200">
                <Plus className="h-4 w-4 mr-2" />
                Manage Services
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Manage Services</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Add New Service</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Service name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Price (₹)"
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Duration"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <Button onClick={addService} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
                    Add Service
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Current Services</h3>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                        <div>
                          <span className="font-medium">{service.name}</span>
                          <span className="text-gray-600 ml-2">
                            ₹{service.price} - {service.duration}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeService(service.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-pink-200">
                <Plus className="h-4 w-4 mr-2" />
                Manage Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Manage Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Add New Staff Member</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Staff name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Role"
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <Button onClick={addStaff} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
                    Add Staff Member
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Current Staff</h3>
                  <div className="space-y-2">
                    {staff.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <div>
                          <span className="font-medium">{member.name}</span>
                          <span className="text-gray-600 ml-2">{member.role}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeStaff(member.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Book New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input id="customer" placeholder="Enter customer name" className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Phone number" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="Age" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input id="whatsapp" placeholder="WhatsApp number" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name} - ₹{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Any special requirements..." className="rounded-xl" />
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                  Book Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {appointment.customer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{appointment.customer}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {appointment.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Scissors className="h-3 w-3" />
                        {appointment.service}
                      </div>
                      <span>Age: {appointment.age}</span>
                      <Badge
                        variant="outline"
                        className={
                          appointment.source === "Online"
                            ? "border-blue-200 text-blue-700"
                            : "border-green-200 text-green-700"
                        }
                      >
                        {appointment.source}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                      <Clock className="h-4 w-4" />
                      {appointment.time} - {appointment.date}
                    </div>
                    <p className="text-xs text-gray-600">{appointment.duration}</p>
                    <p className="text-xs text-gray-600">with {appointment.staff}</p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  <div className="flex gap-1">
                    {appointment.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, "Confirmed")}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, "Rescheduled")}
                          className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, "Cancelled")}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
