"use client"

import { useState, useMemo } from "react"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Plus, Clock, DollarSign, Users, BookOpen, Eye, Edit, Trash2, AlertCircle } from "lucide-react"

export function Courses() {
  const { courses, addCourse, updateCourse, deleteCourse, syncing } = useSupabaseData()
  
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<any>(null)

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: "",
    fees: "",
    maxCapacity: "",
    instructor: "",
    startDate: "",
    endDate: "",
    schedule: "",
  })

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.fees || !newCourse.duration) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await addCourse({
        name: newCourse.name,
        description: newCourse.description,
        price: parseFloat(newCourse.fees) || 0,
        duration: newCourse.duration,
        max_students: parseInt(newCourse.maxCapacity) || 20,
        current_students: 0,
        status: "Active",
        start_date: newCourse.startDate || null,
        end_date: newCourse.endDate || null,
        schedule: newCourse.schedule || null,
        instructor_id: null
      })
      
      setNewCourse({
        name: "",
        description: "",
        duration: "",
        fees: "",
        maxCapacity: "",
        instructor: "",
        startDate: "",
        endDate: "",
        schedule: "",
      })
      setShowAddDialog(false)
      toast.success('Course added successfully!')
    } catch (error) {
      console.error('Error adding course:', error)
      toast.error('Failed to add course')
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return

    try {
      await updateCourse(editingCourse.id, {
        name: editingCourse.name,
        description: editingCourse.description,
        price: editingCourse.price,
        duration: editingCourse.duration,
        max_students: editingCourse.max_students,
        current_students: editingCourse.current_students,
        status: editingCourse.status,
        start_date: editingCourse.start_date,
        end_date: editingCourse.end_date,
        schedule: editingCourse.schedule
      })
      
      setEditingCourse(null)
      toast.success('Course updated successfully!')
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Failed to update course')
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await deleteCourse(courseId)
      setShowDeleteDialog(null)
      toast.success('Course deleted successfully!')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Inactive":
        return "bg-red-100 text-red-700"
      case "Completed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Courses & Academy</h1>
          <p className="text-gray-600">Manage academy courses and training programs</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {courses.reduce((sum, course) => sum + course.current_students, 0)}
                </p>
                <p className="text-sm text-gray-600">Enrolled Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{(courses.reduce((sum, course) => sum + course.price * course.current_students, 0) / 1000).toFixed(0)}
                  K
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {courses.filter((c) => c.status === "Active").length}
                </p>
                <p className="text-sm text-gray-600">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="rounded-2xl border-pink-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-gray-800">{course.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructor_id || 'Not assigned'}</p>
                </div>
                <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>₹{course.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enrollment</span>
                  <span className="font-medium">
                    {course.current_students}/{course.max_students}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(course.current_students / course.max_students) * 100}%` }}
                  ></div>
                </div>
              </div>

              {course.start_date && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {new Date(course.start_date).toLocaleDateString()} -{" "}
                    {course.end_date ? new Date(course.end_date).toLocaleDateString() : "Ongoing"}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCourse(course)}
                  className="flex-1 rounded-lg"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCourse({ ...course })}
                  className="flex-1 rounded-lg"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Course
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(course)}
                  className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                placeholder="Enter course name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Course description and objectives"
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fees">Course Fees (₹) *</Label>
                <Input
                  id="fees"
                  type="number"
                  value={newCourse.fees}
                  onChange={(e) => setNewCourse({ ...newCourse, fees: e.target.value })}
                  placeholder="25000"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newCourse.maxCapacity}
                  onChange={(e) => setNewCourse({ ...newCourse, maxCapacity: e.target.value })}
                  placeholder="20"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  placeholder="Instructor name"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCourse.startDate}
                  onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCourse.endDate}
                  onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={newCourse.schedule}
                onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                placeholder="Mon, Wed, Fri - 10:00 AM to 2:00 PM"
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={handleAddCourse}
              disabled={!newCourse.name || !newCourse.fees || !newCourse.duration || syncing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
            >
              {syncing ? 'Adding...' : 'Add Course'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Course Details Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">{selectedCourse?.name}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Course Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Duration:</strong> {selectedCourse.duration}
                    </p>
                    <p>
                      <strong>Fees:</strong> ₹{selectedCourse.price.toLocaleString()}
                    </p>
                    <p>
                      <strong>Instructor:</strong> {selectedCourse.instructor_id || 'Not assigned'}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {selectedCourse.max_students} students
                    </p>
                    <p>
                      <strong>Enrolled:</strong> {selectedCourse.current_students} students
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Schedule & Dates</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Schedule:</strong> {selectedCourse.schedule || 'Not set'}
                    </p>
                    <p>
                      <strong>Start Date:</strong> {selectedCourse.start_date ? new Date(selectedCourse.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                    {selectedCourse.end_date && (
                      <p>
                        <strong>End Date:</strong> {new Date(selectedCourse.end_date).toLocaleDateString()}
                      </p>
                    )}
                    <Badge className={getStatusColor(selectedCourse.status)}>{selectedCourse.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedCourse.description}</p>
              </div>

              {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Course Syllabus</h4>
                  <ul className="space-y-1">
                    {selectedCourse.syllabus?.map((topic: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enrollment Progress</span>
                  <span className="font-medium">
                    {selectedCourse.current_students}/{selectedCourse.max_students}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(selectedCourse.current_students / selectedCourse.max_students) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Edit Course</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Course Name</Label>
                <Input
                  id="editName"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="rounded-xl"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDuration">Duration</Label>
                  <Input
                    id="editDuration"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                                  <div className="space-y-2">
                    <Label htmlFor="editFees">Fees (₹)</Label>
                    <Input
                      id="editFees"
                      type="number"
                      value={editingCourse.price}
                      onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) || 0 })}
                      className="rounded-xl"
                    />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                    <Label htmlFor="editCapacity">Max Capacity</Label>
                    <Input
                      id="editCapacity"
                      type="number"
                      value={editingCourse.max_students}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, max_students: parseInt(e.target.value) || 0 })
                      }
                      className="rounded-xl"
                    />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editingCourse.status}
                    onValueChange={(value) => setEditingCourse({ ...editingCourse, status: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Enrolling">Enrolling</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                                <div className="space-y-2">
                    <Label htmlFor="editInstructor">Instructor ID</Label>
                    <Input
                      id="editInstructor"
                      type="number"
                      value={editingCourse.instructor_id || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor_id: parseInt(e.target.value) || null })}
                      className="rounded-xl"
                    />
                  </div>
              <div className="space-y-2">
                <Label htmlFor="editSchedule">Schedule</Label>
                <Input
                  id="editSchedule"
                  value={editingCourse.schedule}
                  onChange={(e) => setEditingCourse({ ...editingCourse, schedule: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleUpdateCourse}
                disabled={syncing}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {syncing ? 'Updating...' : 'Update Course'}
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
              Delete Course
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
                  onClick={() => handleDeleteCourse(showDeleteDialog.id)}
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
