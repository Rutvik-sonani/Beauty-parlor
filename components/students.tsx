"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  BookOpen,
  GraduationCap,
  Eye,
  Edit,
  Filter,
  Trash2,
  AlertCircle,
} from "lucide-react"

export function Students() {
  const { students, courses, addStudent, updateStudent, deleteStudent, syncing } = useSupabaseData()
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<any>(null)
  const [filterCourse, setFilterCourse] = useState("all")
  const [filterPayment, setFilterPayment] = useState("all")

  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    age: "",
    course: "",
    totalFees: "",
    batch: "",
    address: "",
    emergencyContact: "",
  })

  const [paymentAmount, setPaymentAmount] = useState("")

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.phone || !newStudent.email || !newStudent.course) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Find the course ID by name
      const selectedCourse = courses.find(c => c.name === newStudent.course)
      if (!selectedCourse) {
        toast.error('Selected course not found')
        return
      }

      await addStudent({
        name: newStudent.name,
        phone: newStudent.phone,
        email: newStudent.email,
        course_id: selectedCourse.id,
        enrollment_date: new Date().toISOString().split('T')[0],
        payment_status: "Pending",
        progress: 0,
        total_fees: parseFloat(newStudent.totalFees) || 0,
        paid_amount: 0,
        status: "Active",
        age: parseInt(newStudent.age) || null,
        whatsapp: newStudent.whatsapp || null,
        address: newStudent.address || null,
        emergency_contact: newStudent.emergencyContact || null,
        batch: newStudent.batch || null
      })
      
      setNewStudent({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        age: "",
        course: "",
        totalFees: "",
        batch: "",
        address: "",
        emergencyContact: "",
      })
      setShowAddDialog(false)
      toast.success('Student added successfully!')
    } catch (error) {
      console.error('Error adding student:', error)
      toast.error('Failed to add student')
    }
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    try {
      await updateStudent(editingStudent.id, {
        name: editingStudent.name,
        phone: editingStudent.phone,
        email: editingStudent.email,
        progress: editingStudent.progress,
        batch: editingStudent.batch,
        age: editingStudent.age,
        whatsapp: editingStudent.whatsapp,
        address: editingStudent.address,
        emergency_contact: editingStudent.emergency_contact
      })
      
      setEditingStudent(null)
      toast.success('Student updated successfully!')
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Failed to update student')
    }
  }

  const handleUpdatePayment = async () => {
    if (!showPaymentDialog || !paymentAmount) return

    try {
      const amount = parseFloat(paymentAmount)
      const newPaidAmount = showPaymentDialog.paid_amount + amount
      const newPaymentStatus = newPaidAmount >= showPaymentDialog.total_fees
        ? "Paid"
        : newPaidAmount > 0
          ? "Partial"
          : "Pending"

      await updateStudent(showPaymentDialog.id, {
        paid_amount: newPaidAmount,
        payment_status: newPaymentStatus
      })
      
      setShowPaymentDialog(null)
      setPaymentAmount("")
      toast.success('Payment updated successfully!')
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Failed to update payment')
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await deleteStudent(studentId)
      setShowDeleteDialog(null)
      toast.success('Student deleted successfully!')
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
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

  // Get course name by ID
  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.name : 'Unknown Course'
  }

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const courseName = getCourseName(student.course_id)
      const courseMatch = filterCourse === "all" || courseName === filterCourse
      const paymentMatch = filterPayment === "all" || student.payment_status === filterPayment
      return courseMatch && paymentMatch
    })
  }, [students, courses, filterCourse, filterPayment])

  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    return [...new Set(courses.map((c) => c.name))]
  }, [courses])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-600">Manage academy students and their progress</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filter by Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filter by Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{filteredStudents.length}</p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {filteredStudents.filter((s) => s.progress > 80).length}
                </p>
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
                  ₹{(filteredStudents.reduce((sum, s) => sum + s.paid_amount, 0) / 1000).toFixed(0)}K
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
                  {filteredStudents.filter((s) => s.payment_status === "Pending").length}
                </p>
                <p className="text-sm text-gray-600">Pending Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg">
                    {student.name
                      .split(" ")
                      .map((n: string) => n[0])
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
                    <p className="text-sm text-gray-600 mt-1">Age: {student.age || 'N/A'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Course Details</h4>
                    <p className="text-sm text-gray-600 mt-1">{getCourseName(student.course_id)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(student.enrollment_date).toLocaleDateString()}
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
                      <Badge className={getPaymentStatusColor(student.payment_status)}>{student.payment_status}</Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{student.paid_amount.toLocaleString()} / ₹{student.total_fees.toLocaleString()}
                      </p>
                      {student.payment_status !== "Paid" && (
                        <p className="text-sm text-red-600 mt-1">
                          Pending: ₹{(student.total_fees - student.paid_amount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStudent(student)}
                    className="rounded-lg"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingStudent({ ...student })}
                    className="rounded-lg"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {student.payment_status !== "Paid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPaymentDialog(student)}
                      className="text-green-600 border-green-200 hover:bg-green-50 rounded-lg"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Update Payment
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(student)}
                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
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
              <Select
                value={newStudent.course}
                onValueChange={(value) => setNewStudent({ ...newStudent, course: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional Hair Styling">Professional Hair Styling</SelectItem>
                  <SelectItem value="Advanced Facial Treatments">Advanced Facial Treatments</SelectItem>
                  <SelectItem value="Makeup Artistry">Makeup Artistry</SelectItem>
                  <SelectItem value="Nail Art & Design">Nail Art & Design</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                placeholder="Full address"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={newStudent.emergencyContact}
                onChange={(e) => setNewStudent({ ...newStudent, emergencyContact: e.target.value })}
                placeholder="Emergency contact number"
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={handleAddStudent}
              disabled={!newStudent.name || !newStudent.phone || !newStudent.email || !newStudent.course || syncing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              {syncing ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Student Profile Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">{selectedStudent?.name} - Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xl">
                    {selectedStudent.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{getCourseName(selectedStudent.course_id)}</p>
                  <Badge className={getPaymentStatusColor(selectedStudent.payment_status)}>
                    {selectedStudent.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Age:</strong> {selectedStudent.age} years
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedStudent.phone}
                    </p>
                    <p>
                      <strong>WhatsApp:</strong> {selectedStudent.whatsapp}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedStudent.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedStudent.address}
                    </p>
                    <p>
                      <strong>Emergency Contact:</strong> {selectedStudent.emergencyContact}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Course:</strong> {getCourseName(selectedStudent.course_id)}
                    </p>
                    <p>
                      <strong>Batch:</strong> {selectedStudent.batch || 'N/A'}
                    </p>
                    <p>
                      <strong>Enrollment Date:</strong> {new Date(selectedStudent.enrollment_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Progress:</strong> {selectedStudent.progress}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Payment Details</h4>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">₹{selectedStudent.paid_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Paid</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{(selectedStudent.total_fees - selectedStudent.paid_amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{selectedStudent.total_fees.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Progress Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Completion</span>
                    <span className="font-medium">{selectedStudent.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${selectedStudent.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAge">Age</Label>
                  <Input
                    id="editAge"
                    type="number"
                    value={editingStudent.age}
                    onChange={(e) => setEditingStudent({ ...editingStudent, age: Number.parseInt(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editProgress">Progress (%)</Label>
                <Input
                  id="editProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={editingStudent.progress}
                  onChange={(e) => setEditingStudent({ ...editingStudent, progress: Number.parseInt(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBatch">Batch</Label>
                <Input
                  id="editBatch"
                  value={editingStudent.batch}
                  onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleUpdateStudent}
                disabled={syncing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {syncing ? 'Updating...' : 'Update Student'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Payment Dialog */}
      <Dialog open={!!showPaymentDialog} onOpenChange={() => setShowPaymentDialog(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Update Payment - {showPaymentDialog?.name}</DialogTitle>
          </DialogHeader>
          {showPaymentDialog && (
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Fees</p>
                    <p className="font-semibold">₹{showPaymentDialog.total_fees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Paid Amount</p>
                    <p className="font-semibold text-green-600">₹{showPaymentDialog.paid_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pending Amount</p>
                    <p className="font-semibold text-red-600">
                      ₹{(showPaymentDialog.total_fees - showPaymentDialog.paid_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge className={getPaymentStatusColor(showPaymentDialog.payment_status)}>
                      {showPaymentDialog.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="rounded-xl"
                  max={showPaymentDialog.total_fees - showPaymentDialog.paid_amount}
                />
              </div>

              <Button
                onClick={handleUpdatePayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || syncing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {syncing ? 'Updating...' : 'Update Payment'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Delete Student
            </DialogTitle>
          </DialogHeader>
          {showDeleteDialog && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{showDeleteDialog.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowDeleteDialog(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
                  onClick={() => handleDeleteStudent(showDeleteDialog.id)}
                  disabled={syncing}
                >
                  {syncing ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
