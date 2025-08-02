"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Plus, Clock, DollarSign, Users, BookOpen, Trash2, Edit } from "lucide-react"

export function EnhancedCourses() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Professional Hair Styling",
      description: "Complete course covering all aspects of hair cutting, styling, and coloring techniques.",
      duration: "3 months",
      fees: 25000,
      enrolledStudents: 15,
      maxCapacity: 20,
      status: "Active",
      startDate: "2024-02-01",
      instructor: "Emma Wilson",
    },
    {
      id: 2,
      name: "Advanced Facial Treatments",
      description: "Master the art of facial treatments including deep cleansing and anti-aging techniques.",
      duration: "2 months",
      fees: 18000,
      enrolledStudents: 12,
      maxCapacity: 15,
      status: "Active",
      startDate: "2024-01-15",
      instructor: "Sophia Brown",
    },
  ])

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: "",
    fees: "",
    maxCapacity: "",
    instructor: "",
    startDate: "",
  })

  const addCourse = () => {
    if (newCourse.name && newCourse.fees && newCourse.duration) {
      setCourses([
        ...courses,
        {
          id: courses.length + 1,
          ...newCourse,
          fees: Number.parseInt(newCourse.fees),
          maxCapacity: Number.parseInt(newCourse.maxCapacity) || 20,
          enrolledStudents: 0,
          status: "Enrolling",
        },
      ])
      setNewCourse({
        name: "",
        description: "",
        duration: "",
        fees: "",
        maxCapacity: "",
        instructor: "",
        startDate: "",
      })
    }
  }

  const removeCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Enrolling":
        return "bg-blue-100 text-blue-700"
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
          <h1 className="text-3xl font-bold text-gray-800">Enhanced Courses & Academy</h1>
          <p className="text-gray-600">Manage academy courses with enhanced features</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Create New Course</DialogTitle>
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
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
              <Button
                onClick={addCourse}
                disabled={!newCourse.name || !newCourse.fees || !newCourse.duration}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Create Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
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
                  ₹{(courses.reduce((sum, course) => sum + course.fees * course.enrolledStudents, 0) / 1000).toFixed(0)}
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
                  <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructor}</p>
                </div>
                <div className="flex gap-1">
                  <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeCourse(course.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
                  <span>₹{course.fees.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enrollment</span>
                  <span className="font-medium">
                    {course.enrolledStudents}/{course.maxCapacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(course.enrolledStudents / course.maxCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {course.startDate && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong>Start Date:</strong> {new Date(course.startDate).toLocaleDateString()}
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
