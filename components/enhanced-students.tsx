"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Phone, Mail, Calendar, DollarSign, BookOpen, GraduationCap, Trash2, Edit } from "lucide-react"

export function EnhancedStudents() {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Priya Sharma",
      phone: "+91 98765-43210",
      whatsapp: "+91 98765-43210",
      email: "priya.sharma@email.com",
      age: 22,
      course: "Professional Hair Styling",
      startDate: "2024-02-01",
      endDate: "2024-05-01",
      feesPaid: 25000,
      totalFees: 25000,
      paymentStatus: "Paid",
      progress: 65,
      batch: "Batch A",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Anita Patel",
      phone: "+91 98765-43211",
      whatsapp: "+91 98765-43211",
      email: "anita.patel@email.com",
      age: 25,
      course: "Advanced Facial Treatments",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      feesPaid: 15000,
      totalFees: 18000,
      paymentStatus: "Partial",
      progress: 80,
      batch: "Batch B",
      joinDate: "2024-01-01",
    },
  ])

  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    age: "",
    course: "",
    totalFees: "",
    batch: "",
  })

  const addStudent = () => {
    if (newStudent.name && newStudent.phone && newStudent.email && newStudent.course) {
      setStudents([
        ...students,
        {
          id: students.length + 1,
          ...newStudent,
          age: Number.parseInt(newStudent.age) || 0,
          totalFees: Number.parseInt(newStudent.totalFees) || 0,
          feesPaid: 0,
          paymentStatus: "Pending",
          progress: 0,
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          joinDate: new Date().toISOString().split("T")[0],
        },
      ])
      setNewStudent({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        age: "",
        course: "",
        totalFees: "",
        batch: "",
      })
    }
  }

  const removeStudent = (id: number) => {
    setStudents(students.filter((student) => student.id !== id))
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700"
      case "Partial":
        return "bg-yellow-100 text-yellow-700"
      case "Pending":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Enhanced Student Management</h1>
          <p className="text-gray-600">Manage academy students with enhanced features</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="Phone number"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                    placeholder="Age"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={newStudent.whatsapp}
                  onChange={(e) => setNewStudent({ ...newStudent, whatsapp: e.target.value })}
                  placeholder="WhatsApp number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="Email address"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Input
                  id="course"
                  value={newStudent.course}
                  onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                  placeholder="Course name"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalFees">Total Fees (₹)</Label>
                  <Input
                    id="totalFees"
                    type="number"
                    value={newStudent.totalFees}
                    onChange={(e) => setNewStudent({ ...newStudent, totalFees: e.target.value })}
                    placeholder="Total fees"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Input
                    id="batch"
                    value={newStudent.batch}
                    onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                    placeholder="Batch name"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                onClick={addStudent}
                disabled={!newStudent.name || !newStudent.phone || !newStudent.email || !newStudent.course}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{students.filter((s) => s.progress > 80).length}</p>
                <p className="text-sm text-gray-600">Near Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{(students.reduce((sum, s) => sum + s.feesPaid, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Fees Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {students.filter((s) => s.paymentStatus === "Pending").length}
                </p>
                <p className="text-sm text-gray-600">Pending Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <div className="grid gap-4">
        {students.map((student) => (
          <Card key={student.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid gap-4 md:grid-cols-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.batch}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.email}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Age: {student.age}</p>
                    {student.whatsapp && <p className="text-sm text-gray-600">WhatsApp: {student.whatsapp}</p>}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Course Details</h4>
                    <p className="text-sm text-gray-600 mt-1">{student.course}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(student.startDate).toLocaleDateString()}
                        {student.endDate && ` - ${new Date(student.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Progress</h4>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-medium">{student.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Payment</h4>
                    <div className="mt-2">
                      <Badge className={getPaymentStatusColor(student.paymentStatus)}>{student.paymentStatus}</Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{student.feesPaid.toLocaleString()} / ₹{student.totalFees.toLocaleString()}
                      </p>
                      {student.paymentStatus !== "Paid" && (
                        <p className="text-sm text-red-600 mt-1">
                          Pending: ₹{(student.totalFees - student.feesPaid).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeStudent(student.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
