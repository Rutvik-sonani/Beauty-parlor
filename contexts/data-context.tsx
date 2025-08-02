"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  birthday: string
  anniversary?: string
  tier: string
  totalSpent: number
  totalVisits: number
  status: string
  lastVisit: string
  notes: string
}

interface Appointment {
  id: number
  customername: string
  customerphone: string
  customeremail: string
  service: string
  staff: string
  date: string
  time: string
  duration: string
  price: number
  status: string
  notes: string
  source: string
}

interface Staff {
  id: number
  name: string
  role: string
  phone: string
  email: string
  specialization: string
  experience: number
  salary: number
  joinDate: string
  status: string
}

interface Service {
  id: number
  name: string
  category: string
  duration: string
  price: number
  description: string
  status: string
  image?: string
}

interface Product {
  id: number
  name: string
  category: string
  brand: string
  quantity: number
  minStock: number
  price: number
  supplier: string
  expiryDate: string
  status: string
  description: string
  image?: string
}

interface Package {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  duration: string
  services: string[]
  status: string
  isPopular: boolean
  image?: string
}

interface Course {
  id: number
  name: string
  description: string
  duration: string
  price: number
  status: string
  enrolledStudents: number
  maxStudents: number
  startDate: string
  instructor: string
}

interface Review {
  id: number
  customerName: string
  email: string
  phone: string
  service: string
  rating: number
  comment: string
  date: string
  status: string
  isVisible: boolean
  source: string
  response: string
}

interface Student {
  id: number
  name: string
  phone: string
  email: string
  course: string
  enrollmentDate: string
  feesPaid: number
  totalFees: number
  status: string
  progress: number
}

interface InventoryItem {
  id: number
  name: string
  category: string
  brand: string
  quantity: number
  minStock: number
  price: number
  supplier: string
  expiryDate: string
  status: string
}

interface DataContextType {
  // Data
  customers: Customer[]
  appointments: Appointment[]
  staff: Staff[]
  services: Service[]
  products: Product[]
  packages: Package[]
  courses: Course[]
  reviews: Review[]
  students: Student[]
  inventory: InventoryItem[]

  // CRUD operations
  addCustomer: (customer: Omit<Customer, "id">) => void
  updateCustomer: (id: number, customer: Partial<Customer>) => void
  deleteCustomer: (id: number) => void

  addAppointment: (appointment: Omit<Appointment, "id">) => void
  updateAppointment: (id: number, appointment: Partial<Appointment>) => void
  deleteAppointment: (id: number) => void

  addStaff: (staff: Omit<Staff, "id">) => void
  updateStaff: (id: number, staff: Partial<Staff>) => void
  deleteStaff: (id: number) => void

  addService: (service: Omit<Service, "id">) => void
  updateService: (id: number, service: Partial<Service>) => void
  deleteService: (id: number) => void

  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  deleteProduct: (id: number) => void

  addPackage: (pkg: Omit<Package, "id">) => void
  updatePackage: (id: number, pkg: Partial<Package>) => void
  deletePackage: (id: number) => void

  addCourse: (course: Omit<Course, "id">) => void
  updateCourse: (id: number, course: Partial<Course>) => void
  deleteCourse: (id: number) => void

  addReview: (review: Omit<Review, "id">) => void
  updateReview: (id: number, review: Partial<Review>) => void
  deleteReview: (id: number) => void

  addStudent: (student: Omit<Student, "id">) => void
  updateStudent: (id: number, student: Partial<Student>) => void
  deleteStudent: (id: number) => void

  addInventoryItem: (item: Omit<InventoryItem, "id">) => void
  updateInventoryItem: (id: number, item: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: number) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Initialize with sample data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      phone: "+1 234-567-8901",
      email: "sarah@example.com",
      birthday: "1990-05-15",
      anniversary: "2015-06-20",
      tier: "Gold",
      totalSpent: 15000,
      totalVisits: 25,
      status: "Active",
      lastVisit: "2024-01-10",
      notes: "Prefers natural hair colors",
    },
  ])

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      customerName: "Sarah Johnson",
      customerPhone: "+1 234-567-8901",
      customerEmail: "sarah@example.com",
      service: "Hair Cut & Color",
      staff: "Emma Wilson",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "2 hours",
      price: 1200,
      status: "Confirmed",
      notes: "First time customer, prefers natural colors",
      source: "Website Booking",
    },
  ])

  const [staff, setStaff] = useState<Staff[]>([
    {
      id: 1,
      name: "Emma Wilson",
      role: "Senior Hair Stylist",
      phone: "+1 555-0101",
      email: "emma@beautypro.com",
      specialization: "Hair Cut, Hair Color, Hair Treatment",
      experience: 8,
      salary: 45000,
      joinDate: "2016-03-15",
      status: "Active",
    },
    {
      id: 2,
      name: "Sophia Brown",
      role: "Facial Specialist",
      phone: "+1 555-0102",
      email: "sophia@beautypro.com",
      specialization: "Facial Treatment, Skin Care, Anti-Aging",
      experience: 6,
      salary: 40000,
      joinDate: "2018-07-20",
      status: "Active",
    },
    {
      id: 3,
      name: "Olivia Taylor",
      role: "Nail Technician",
      phone: "+1 555-0103",
      email: "olivia@beautypro.com",
      specialization: "Manicure, Pedicure, Nail Art",
      experience: 4,
      salary: 35000,
      joinDate: "2020-01-10",
      status: "Active",
    },
    {
      id: 4,
      name: "Isabella Garcia",
      role: "Makeup Artist",
      phone: "+1 555-0104",
      email: "isabella@beautypro.com",
      specialization: "Bridal Makeup, Party Makeup, Photoshoot",
      experience: 10,
      salary: 50000,
      joinDate: "2014-09-05",
      status: "Active",
    },
  ])

  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Hair Cut & Style",
      category: "Hair Care",
      duration: "60 min",
      price: 1200,
      description: "Professional hair cutting and styling with latest trends and techniques",
      status: "Active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Facial Treatment",
      category: "Skin Care",
      duration: "90 min",
      price: 1800,
      description: "Deep cleansing facial with organic products for glowing skin",
      status: "Active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Manicure & Pedicure",
      category: "Nail Care",
      duration: "75 min",
      price: 1000,
      description: "Complete nail care with premium polish and nail art",
      status: "Active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Bridal Makeup",
      category: "Makeup",
      duration: "180 min",
      price: 5000,
      description: "Complete bridal makeover for your special day with premium products",
      status: "Active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      name: "Body Massage",
      category: "Wellness",
      duration: "120 min",
      price: 2500,
      description: "Relaxing full body massage with aromatherapy oils",
      status: "Active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      name: "Hair Coloring",
      category: "Hair Care",
      duration: "150 min",
      price: 3000,
      description: "Professional hair coloring with premium international brands",
      status: "Active",
      image: "/placeholder.svg?height=200&width=300",
    },
  ])

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Premium Hair Shampoo",
      category: "Hair Care",
      brand: "BeautyPro",
      quantity: 50,
      minStock: 10,
      price: 850,
      supplier: "Beauty Supplies Co.",
      expiryDate: "2025-12-31",
      status: "Active",
      description: "Professional grade shampoo for all hair types with natural ingredients",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "Anti-Aging Face Serum",
      category: "Skin Care",
      brand: "GlowMax",
      quantity: 30,
      minStock: 5,
      price: 2500,
      supplier: "Skincare Solutions",
      expiryDate: "2025-08-15",
      status: "Active",
      description: "Advanced anti-aging serum with vitamin C and hyaluronic acid",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 3,
      name: "Nail Polish Set",
      category: "Nail Care",
      brand: "ColorPop",
      quantity: 0,
      minStock: 5,
      price: 1500,
      supplier: "Nail Art Supplies",
      expiryDate: "2026-03-20",
      status: "Active",
      description: "Set of 12 premium nail polishes in trending colors",
      image: "/placeholder.svg?height=200&width=200",
    },
  ])

  const [packages, setPackages] = useState<Package[]>([
    {
      id: 1,
      name: "Bridal Bliss Package",
      description: "Complete bridal makeover package for your special day",
      price: 12000,
      originalPrice: 15000,
      duration: "6 hours",
      services: [
        "Pre-bridal consultation",
        "Hair wash & styling",
        "Bridal makeup",
        "Nail art & polish",
        "Saree draping",
        "Touch-up kit",
      ],
      status: "Active",
      isPopular: true,
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 2,
      name: "Glow Up Package",
      description: "Monthly beauty maintenance package for radiant skin",
      price: 6500,
      originalPrice: 8000,
      duration: "4 sessions",
      services: [
        "Deep cleansing facial",
        "Hair cut & style",
        "Manicure & pedicure",
        "Eyebrow threading",
        "Hair spa treatment",
      ],
      status: "Active",
      isPopular: false,
      image: "/placeholder.svg?height=300&width=400",
    },
  ])

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: "Professional Hair Styling Course",
      description: "Learn professional hair cutting, styling, and coloring techniques",
      duration: "3 months",
      price: 25000,
      status: "Active",
      enrolledStudents: 15,
      maxStudents: 20,
      startDate: "2024-02-01",
      instructor: "Emma Wilson",
    },
    {
      id: 2,
      name: "Advanced Facial Treatment Course",
      description: "Master facial treatments and skin care procedures",
      duration: "2 months",
      price: 18000,
      status: "Active",
      enrolledStudents: 12,
      maxStudents: 15,
      startDate: "2024-02-15",
      instructor: "Sophia Brown",
    },
    {
      id: 3,
      name: "Bridal Makeup Mastery",
      description: "Complete bridal makeup course with hands-on training",
      duration: "4 months",
      price: 35000,
      status: "Active",
      enrolledStudents: 8,
      maxStudents: 12,
      startDate: "2024-03-01",
      instructor: "Isabella Garcia",
    },
  ])

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      customerName: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 234-567-8901",
      service: "Hair Cut & Color",
      rating: 5,
      comment:
        "Amazing service! Emma did a fantastic job with my hair. The salon maintains excellent hygiene standards and uses premium products. Highly recommended!",
      date: "2024-01-15",
      status: "Published",
      isVisible: true,
      source: "Website Feedback",
      response: "",
    },
  ])

  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Priya Sharma",
      phone: "+91 98765-43210",
      email: "priya@example.com",
      course: "Professional Hair Styling Course",
      enrollmentDate: "2024-02-01",
      feesPaid: 15000,
      totalFees: 25000,
      status: "Active",
      progress: 60,
    },
  ])

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Hair Cutting Scissors",
      category: "Tools",
      brand: "Professional",
      quantity: 10,
      minStock: 2,
      price: 2500,
      supplier: "Beauty Tools Inc.",
      expiryDate: "2030-12-31",
      status: "Active",
    },
  ])

  // CRUD operations for customers
  const addCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer = { ...customer, id: Date.now() }
    setCustomers((prev) => [newCustomer, ...prev])
  }

  const updateCustomer = (id: number, customer: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customer } : c)))
  }

  const deleteCustomer = (id: number) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  // CRUD operations for appointments
  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment = { ...appointment, id: Date.now() }
    setAppointments((prev) => [newAppointment, ...prev])
  }

  const updateAppointment = (id: number, appointment: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...appointment } : a)))
  }

  const deleteAppointment = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  // CRUD operations for staff
  const addStaff = (staffMember: Omit<Staff, "id">) => {
    const newStaff = { ...staffMember, id: Date.now() }
    setStaff((prev) => [newStaff, ...prev])
  }

  const updateStaff = (id: number, staffMember: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...staffMember } : s)))
  }

  const deleteStaff = (id: number) => {
    setStaff((prev) => prev.filter((s) => s.id !== id))
  }

  // CRUD operations for services
  const addService = (service: Omit<Service, "id">) => {
    const newService = { ...service, id: Date.now() }
    setServices((prev) => [newService, ...prev])
  }

  const updateService = (id: number, service: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...service } : s)))
  }

  const deleteService = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  // CRUD operations for products
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = { ...product, id: Date.now() }
    setProducts((prev) => [newProduct, ...prev])
  }

  const updateProduct = (id: number, product: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)))
  }

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  // CRUD operations for packages
  const addPackage = (pkg: Omit<Package, "id">) => {
    const newPackage = { ...pkg, id: Date.now() }
    setPackages((prev) => [newPackage, ...prev])
  }

  const updatePackage = (id: number, pkg: Partial<Package>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...pkg } : p)))
  }

  const deletePackage = (id: number) => {
    setPackages((prev) => prev.filter((p) => p.id !== id))
  }

  // CRUD operations for courses
  const addCourse = (course: Omit<Course, "id">) => {
    const newCourse = { ...course, id: Date.now() }
    setCourses((prev) => [newCourse, ...prev])
  }

  const updateCourse = (id: number, course: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...course } : c)))
  }

  const deleteCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  // CRUD operations for reviews
  const addReview = (review: Omit<Review, "id">) => {
    const newReview = { ...review, id: Date.now() }
    setReviews((prev) => [newReview, ...prev])
  }

  const updateReview = (id: number, review: Partial<Review>) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...review } : r)))
  }

  const deleteReview = (id: number) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  // CRUD operations for students
  const addStudent = (student: Omit<Student, "id">) => {
    const newStudent = { ...student, id: Date.now() }
    setStudents((prev) => [newStudent, ...prev])
  }

  const updateStudent = (id: number, student: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...student } : s)))
  }

  const deleteStudent = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  // CRUD operations for inventory
  const addInventoryItem = (item: Omit<InventoryItem, "id">) => {
    const newItem = { ...item, id: Date.now() }
    setInventory((prev) => [newItem, ...prev])
  }

  const updateInventoryItem = (id: number, item: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...item } : i)))
  }

  const deleteInventoryItem = (id: number) => {
    setInventory((prev) => prev.filter((i) => i.id !== id))
  }

  const value: DataContextType = {
    // Data
    customers,
    appointments,
    staff,
    services,
    products,
    packages,
    courses,
    reviews,
    students,
    inventory,

    // CRUD operations
    addCustomer,
    updateCustomer,
    deleteCustomer,

    addAppointment,
    updateAppointment,
    deleteAppointment,

    addStaff,
    updateStaff,
    deleteStaff,

    addService,
    updateService,
    deleteService,

    addProduct,
    updateProduct,
    deleteProduct,

    addPackage,
    updatePackage,
    deletePackage,

    addCourse,
    updateCourse,
    deleteCourse,

    addReview,
    updateReview,
    deleteReview,

    addStudent,
    updateStudent,
    deleteStudent,

    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
