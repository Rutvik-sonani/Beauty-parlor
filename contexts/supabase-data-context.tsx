"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { initializeDatabase, seedInitialData } from "@/lib/init-db"
import { setupDatabase, seedInitialServices } from "@/lib/setup-database"
import { testSupabaseConnection } from "@/lib/test-connection"
import { toast } from "sonner"

interface Customer {
  id: number
  name: string
  phone: string
  email: string | null
  birthday: string | null
  loyalty_points: number
  total_visits: number
  last_visit: string | null
  tier: string
  favorite_service: string | null
  total_spent: number
  notes: string | null
  status: string
  join_date: string
  age: number | null
  whatsapp: string | null
  created_at: string
  updated_at: string
}

interface Appointment {
  id: number
  customername: string
  customerphone: string
  service: string
  staff: string
  date: string
  time: string
  duration: number
  price: number
  status: string
  notes: string
}

interface Staff {
  id: number
  name: string
  role: string
  specialization: string[]
  experience: string
  rating: number
  phone: string
  email: string
  salary: number
  status: string
  availability: string
  join_date: string
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
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

interface Course {
  id: number
  name: string
  duration: string
  description: string
  price: number
  instructor_id: number | null
  max_students: number
  current_students: number
  status: string
  start_date: string | null
  end_date: string | null
  schedule: string | null
  created_at: string
  updated_at: string
}

interface Student {
  id: number
  name: string
  phone: string
  email: string
  course_id: number
  enrollment_date: string
  payment_status: string
  progress: number
  total_fees: number
  paid_amount: number
  status: string
  age: number | null
  whatsapp: string | null
  address: string | null
  emergency_contact: string | null
  batch: string | null
  created_at: string
  updated_at: string
}

interface Review {
  id: number
  customer_id: number
  service_id: number | null
  rating: number
  comment: string
  status: string
  response: string | null
  date: string
  created_at: string
  updated_at: string
}

interface InventoryItem {
  id: number
  name: string
  category: string
  price: number
  stock: number
  min_stock: number
  supplier: string | null
  description: string | null
  status: string
  expiry_date: string | null
  last_restocked: string | null
  created_at: string
  updated_at: string
}

interface SupabaseDataContextType {
  // Data
  customers: Customer[]
  appointments: Appointment[]
  staff: Staff[]
  services: Service[]
  courses: Course[]
  students: Student[]
  inventory: InventoryItem[]
  reviews: Review[]

  // Loading states
  loading: boolean
  syncing: boolean
  connectionStatus: 'connected' | 'disconnected' | 'connecting'

  // CRUD operations
  addCustomer: (customer: Omit<Customer, "id">) => Promise<void>
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>

  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>
  updateAppointment: (id: number, appointment: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: number) => Promise<void>

  addStaff: (staff: Omit<Staff, "id">) => Promise<void>
  updateStaff: (id: number, staff: Partial<Staff>) => Promise<void>
  deleteStaff: (id: number) => Promise<void>

  addService: (service: Omit<Service, "id">) => Promise<void>
  updateService: (id: number, service: Partial<Service>) => Promise<void>
  deleteService: (id: number) => Promise<void>

  addCourse: (course: Omit<Course, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: number) => Promise<void>

  addStudent: (student: Omit<Student, "id" | "created_at" | "updated_at">) => Promise<void>
  updateStudent: (id: number, student: Partial<Student>) => Promise<void>
  deleteStudent: (id: number) => Promise<void>

  addInventoryItem: (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">) => Promise<void>
  updateInventoryItem: (id: number, item: Partial<InventoryItem>) => Promise<void>
  deleteInventoryItem: (id: number) => Promise<void>

  addReview: (review: Omit<Review, "id" | "created_at" | "updated_at">) => Promise<void>
  updateReview: (id: number, review: Partial<Review>) => Promise<void>
  deleteReview: (id: number) => Promise<void>

  // Sync operations
  syncFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined)

export function SupabaseDataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')

  // Real-time subscriptions
  useEffect(() => {
    const setupRealtimeSubscriptions = () => {
      // Services subscription with optimized updates
      const servicesSubscription = supabase
        .channel("services_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "services" }, (payload) => {
          console.log("Service inserted:", payload.new)
          setServices(prev => {
            // Avoid duplicates
            const exists = prev.find(s => s.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new as Service]
          })
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "services" }, (payload) => {
          console.log("Service updated:", payload.new)
          setServices(prev => prev.map(s => s.id === payload.new.id ? payload.new as Service : s))
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "services" }, (payload) => {
          console.log("Service deleted:", payload.old)
          setServices(prev => prev.filter(s => s.id !== payload.old.id))
        })
        .subscribe((status) => {
          console.log('Services subscription status:', status)
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
          } else if (status === 'CLOSED') {
            setConnectionStatus('disconnected')
          }
        })

      // Customers subscription
      const customersSubscription = supabase
        .channel("customers_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "customers" }, (payload) => {
          setCustomers(prev => {
            const exists = prev.find(c => c.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new as Customer]
          })
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "customers" }, (payload) => {
          setCustomers(prev => prev.map(c => c.id === payload.new.id ? payload.new as Customer : c))
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "customers" }, (payload) => {
          setCustomers(prev => prev.filter(c => c.id !== payload.old.id))
        })
        .subscribe()

      // Appointments subscription with status filtering
      const appointmentsSubscription = supabase
        .channel("appointments_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "appointments" }, (payload) => {
          const newAppointment = payload.new as Appointment
          if (newAppointment.status === 'Pending' || newAppointment.status === 'Confirmed') {
            setAppointments(prev => {
              const exists = prev.find(a => a.id === newAppointment.id)
              if (exists) return prev
              return [...prev, newAppointment]
            })
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "appointments" }, (payload) => {
          const updatedAppointment = payload.new as Appointment
          if (updatedAppointment.status === 'Cancelled' || updatedAppointment.status === 'Completed') {
            // Remove from list if cancelled or completed
            setAppointments(prev => prev.filter(a => a.id !== updatedAppointment.id))
          } else {
            // Update if still pending or confirmed
            setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a))
          }
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "appointments" }, (payload) => {
          setAppointments(prev => prev.filter(a => a.id !== payload.old.id))
        })
        .subscribe()

      // Staff subscription
      const staffSubscription = supabase
        .channel("staff_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "staff" }, (payload) => {
          setStaff(prev => [...prev, payload.new as Staff])
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "staff" }, (payload) => {
          setStaff(prev => prev.map(s => s.id === payload.new.id ? payload.new as Staff : s))
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "staff" }, (payload) => {
          setStaff(prev => prev.filter(s => s.id !== payload.old.id))
        })
        .subscribe()

      // Students subscription
      const studentsSubscription = supabase
        .channel("students_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "students" }, (payload) => {
          setStudents(prev => [...prev, payload.new as Student])
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "students" }, (payload) => {
          setStudents(prev => prev.map(s => s.id === payload.new.id ? payload.new as Student : s))
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "students" }, (payload) => {
          setStudents(prev => prev.filter(s => s.id !== payload.old.id))
        })
        .subscribe()

      // Inventory subscription
      const inventorySubscription = supabase
        .channel("inventory_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "inventory" }, (payload) => {
          setInventory(prev => [...prev, payload.new as InventoryItem])
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "inventory" }, (payload) => {
          setInventory(prev => prev.map(i => i.id === payload.new.id ? payload.new as InventoryItem : i))
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "inventory" }, (payload) => {
          setInventory(prev => prev.filter(i => i.id !== payload.old.id))
        })
        .subscribe()

      // Marketing campaigns subscription
      const marketingCampaignsSubscription = supabase
        .channel("marketing_campaigns_realtime")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "marketing_campaigns" }, (payload) => {
          console.log("Marketing campaign inserted:", payload.new)
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "marketing_campaigns" }, (payload) => {
          console.log("Marketing campaign updated:", payload.new)
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "marketing_campaigns" }, (payload) => {
          console.log("Marketing campaign deleted:", payload.old)
        })
        .subscribe()

      return () => {
        servicesSubscription.unsubscribe()
        customersSubscription.unsubscribe()
        appointmentsSubscription.unsubscribe()
        staffSubscription.unsubscribe()
        studentsSubscription.unsubscribe()
        inventorySubscription.unsubscribe()
        marketingCampaignsSubscription.unsubscribe()
      }
    }

    // Only setup subscriptions after initial data load
    if (!loading) {
      const cleanup = setupRealtimeSubscriptions()
      return cleanup
    }
  }, [loading])

  // Sync from Supabase
  const syncFromSupabase = useCallback(async () => {
    try {
      setSyncing(true)

      // Fetch all data in parallel with error handling for each table
      const results = await Promise.allSettled([
        supabase.from("customers").select("*"),
        supabase.from("appointments").select("*"),
        supabase.from("staff").select("*"),
        supabase.from("services").select("*"),
        supabase.from("courses").select("*"),
        supabase.from("students").select("*"),
        supabase.from("products").select("*"),
        supabase.from("reviews").select("*"),
      ])

      // Handle customers
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        setCustomers(results[0].value.data)
      } else if (results[0].status === 'rejected') {
        console.error('Error fetching customers:', results[0].reason)
      }

      // Handle appointments - only show pending/confirmed
      if (results[1].status === 'fulfilled' && results[1].value.data) {
        const activeAppointments = results[1].value.data.filter(apt => 
          apt.status === 'Pending' || apt.status === 'Confirmed'
        )
        setAppointments(activeAppointments)
      } else if (results[1].status === 'rejected') {
        console.error('Error fetching appointments:', results[1].reason)
      }

      // Handle staff
      if (results[2].status === 'fulfilled' && results[2].value.data) {
        setStaff(results[2].value.data)
      } else if (results[2].status === 'rejected') {
        console.error('Error fetching staff:', results[2].reason)
      }

      // Handle services
      if (results[3].status === 'fulfilled' && results[3].value.data) {
        setServices(results[3].value.data)
      } else if (results[3].status === 'rejected') {
        console.error('Error fetching services:', results[3].reason)
      }

      // Handle courses
      if (results[4].status === 'fulfilled' && results[4].value.data) {
        setCourses(results[4].value.data)
      } else if (results[4].status === 'rejected') {
        console.error('Error fetching courses:', results[4].reason)
      }

      // Handle students
      if (results[5].status === 'fulfilled' && results[5].value.data) {
        setStudents(results[5].value.data)
      } else if (results[5].status === 'rejected') {
        console.error('Error fetching students:', results[5].reason)
      }

      // Handle inventory (products)
      if (results[6].status === 'fulfilled' && results[6].value.data) {
        setInventory(results[6].value.data)
      } else if (results[6].status === 'rejected') {
        console.error('Error fetching products:', results[6].reason)
      }

      // Handle reviews
      if (results[7].status === 'fulfilled' && results[7].value.data) {
        setReviews(results[7].value.data)
      } else if (results[7].status === 'rejected') {
        console.error('Error fetching reviews:', results[7].reason)
      }

    } catch (error) {
      console.error("Error syncing from Supabase:", error)
      toast.error("Failed to sync data from database")
    } finally {
      setSyncing(false)
      setLoading(false)
    }
  }, [])

  // Sync to Supabase
  const syncToSupabase = useCallback(async () => {
    try {
      setSyncing(true)

      // This would typically involve more complex logic to determine what needs to be synced
      // For now, we'll just trigger a refresh
      await syncFromSupabase()
    } catch (error) {
      console.error("Error syncing to Supabase:", error)
      toast.error("Failed to sync data to database")
    } finally {
      setSyncing(false)
    }
  }, [syncFromSupabase])

  // Initial data load with retry logic
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    
    const initAndSync = async () => {
      try {
        console.log(`🚀 Initializing Beauty Parlor Management System... (Attempt ${retryCount + 1}/${maxRetries})`)
        setConnectionStatus('connecting')
        
        // Test connection first
        const connectionTest = await testSupabaseConnection()
        
        if (!connectionTest.success) {
          console.error('❌ Database connection failed:', connectionTest.message)
          
          if (retryCount < maxRetries - 1) {
            retryCount++
            console.log(`🔄 Retrying in 2 seconds... (${retryCount}/${maxRetries})`)
            setTimeout(initAndSync, 2000)
            return
          }
          
          setConnectionStatus('disconnected')
          
          if (connectionTest.message === 'Tables not created') {
            toast.error('Database tables not found. Please run the SQL script from scripts/create-tables.sql in your Supabase dashboard.')
          } else {
            toast.error(`Database connection failed after ${maxRetries} attempts: ${connectionTest.message}`)
          }
          
          setLoading(false)
          return
        }
        
        console.log('✅ Database connection successful')
        setConnectionStatus('connected')
        
        // Seed initial data if needed
        if (connectionTest.count?.[0]?.count === 0) {
          console.log('📝 Seeding initial data...')
          await seedInitialServices()
        }
        
        // Load all data
        console.log('📊 Loading data...')
        await syncFromSupabase()
        
        console.log('🎉 System initialized successfully!')
        retryCount = 0 // Reset retry count on success
        
      } catch (error) {
        console.error('❌ System initialization failed:', error)
        
        if (retryCount < maxRetries - 1) {
          retryCount++
          console.log(`🔄 Retrying in 3 seconds... (${retryCount}/${maxRetries})`)
          setTimeout(initAndSync, 3000)
          return
        }
        
        setConnectionStatus('disconnected')
        toast.error(`System initialization failed after ${maxRetries} attempts. Please check console for details.`)
        setLoading(false)
      }
    }
    
    initAndSync()
  }, [syncFromSupabase])

  // CRUD operations for customers
  const addCustomer = async (customer: Omit<Customer, "id">) => {
    try {
      const { data, error } = await supabase.from("customers").insert([customer]).select()

      if (error) throw error
      toast.success("Customer added successfully")
    } catch (error) {
      console.error("Error adding customer:", error)
      toast.error("Failed to add customer")
    }
  }

  const updateCustomer = async (id: number, customer: Partial<Customer>) => {
    try {
      const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select()

      if (error) throw error
      toast.success("Customer updated successfully")
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Failed to update customer")
    }
  }

  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) throw error
      toast.success("Customer deleted successfully")
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer")
    }
  }

  // CRUD operations for appointments
  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
      setSyncing(true)
      console.log('Adding appointment:', appointment)
      const { data, error } = await supabase.from("appointments").insert([appointment]).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Appointment added successfully:', data)
      toast.success("Appointment added successfully")
      
      // Fallback: update local state if real-time doesn't work
      if (data && data.length > 0) {
        setAppointments(prev => [...prev, ...data])
      }
    } catch (error) {
      console.error("Error adding appointment:", error)
      toast.error("Failed to add appointment")
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const updateAppointment = async (id: number, appointment: Partial<Appointment>) => {
    try {
      setSyncing(true)
      console.log('Updating appointment:', id, appointment)
      
      // Update in database
      const { data, error } = await supabase
        .from("appointments")
        .update(appointment)
        .eq("id", id)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Appointment updated successfully:', data)
      toast.success("Appointment updated successfully")
      
      // Force immediate local state update
      if (data && data.length > 0) {
        setAppointments(prev => {
          const updated = prev.map(a => a.id === id ? { ...a, ...data[0] } : a)
          console.log('Local state updated:', updated)
          return updated
        })
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast.error(`Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const deleteAppointment = async (id: number) => {
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id)

      if (error) throw error
      toast.success("Appointment deleted successfully")
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Failed to delete appointment")
    }
  }

  // CRUD operations for staff
  const addStaff = async (staffMember: Omit<Staff, "id">) => {
    try {
      const { data, error } = await supabase.from("staff").insert([staffMember]).select()

      if (error) throw error
      if (data) {
        setStaff((prev) => [...prev, ...data])
        toast.success("Staff member added successfully")
      }
    } catch (error) {
      console.error("Error adding staff:", error)
      toast.error("Failed to add staff member")
    }
  }

  const updateStaff = async (id: number, staffMember: Partial<Staff>) => {
    try {
      const { data, error } = await supabase.from("staff").update(staffMember).eq("id", id).select()

      if (error) throw error
      if (data) {
        setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data[0] } : s)))
        toast.success("Staff member updated successfully")
      }
    } catch (error) {
      console.error("Error updating staff:", error)
      toast.error("Failed to update staff member")
    }
  }

  const deleteStaff = async (id: number) => {
    try {
      const { error } = await supabase.from("staff").delete().eq("id", id)

      if (error) throw error
      setStaff((prev) => prev.filter((s) => s.id !== id))
      toast.success("Staff member deleted successfully")
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast.error("Failed to delete staff member")
    }
  }

  // CRUD operations for services
  const addService = async (service: Omit<Service, "id">) => {
    try {
      setSyncing(true)
      console.log('Adding service:', service)
      const { data, error } = await supabase.from("services").insert([service]).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Service added successfully:', data)
      toast.success("Service added successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setServices(prev => {
          const exists = prev.find(s => s.id === data[0].id)
          if (exists) return prev
          return [...prev, ...data]
        })
      }
    } catch (error) {
      console.error("Error adding service:", error)
      toast.error(`Failed to add service: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const updateService = async (id: number, service: Partial<Service>) => {
    try {
      setSyncing(true)
      console.log('Updating service:', id, service)
      const { data, error } = await supabase.from("services").update(service).eq("id", id).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Service updated successfully:', data)
      toast.success("Service updated successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...data[0] } : s))
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const deleteService = async (id: number) => {
    try {
      setSyncing(true)
      console.log('Deleting service:', id)
      const { error } = await supabase.from("services").delete().eq("id", id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Service deleted successfully')
      toast.success("Service deleted successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error(`Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  // CRUD operations for courses
  const addCourse = async (course: Omit<Course, "id" | "created_at" | "updated_at">) => {
    try {
      setSyncing(true)
      console.log('Adding course:', course)
      const { data, error } = await supabase.from("courses").insert([course]).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Course added successfully:', data)
      toast.success("Course added successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setCourses(prev => {
          const exists = prev.find(c => c.id === data[0].id)
          if (exists) return prev
          return [...prev, ...data]
        })
      }
    } catch (error) {
      console.error("Error adding course:", error)
      toast.error(`Failed to add course: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const updateCourse = async (id: number, course: Partial<Course>) => {
    try {
      setSyncing(true)
      console.log('Updating course:', id, course)
      const { data, error } = await supabase.from("courses").update(course).eq("id", id).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Course updated successfully:', data)
      toast.success("Course updated successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data[0] } : c))
      }
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error(`Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const deleteCourse = async (id: number) => {
    try {
      setSyncing(true)
      console.log('Deleting course:', id)
      const { error } = await supabase.from("courses").delete().eq("id", id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Course deleted successfully')
      toast.success("Course deleted successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error(`Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  // CRUD operations for students
  const addStudent = async (student: Omit<Student, "id" | "created_at" | "updated_at">) => {
    try {
      setSyncing(true)
      console.log('Adding student:', student)
      const { data, error } = await supabase.from("students").insert([student]).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Student added successfully:', data)
      toast.success("Student added successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setStudents(prev => {
          const exists = prev.find(s => s.id === data[0].id)
          if (exists) return prev
          return [...prev, ...data]
        })
      }
    } catch (error) {
      console.error("Error adding student:", error)
      toast.error(`Failed to add student: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const updateStudent = async (id: number, student: Partial<Student>) => {
    try {
      setSyncing(true)
      console.log('Updating student:', id, student)
      const { data, error } = await supabase.from("students").update(student).eq("id", id).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Student updated successfully:', data)
      toast.success("Student updated successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data[0] } : s))
      }
    } catch (error) {
      console.error("Error updating student:", error)
      toast.error(`Failed to update student: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const deleteStudent = async (id: number) => {
    try {
      setSyncing(true)
      console.log('Deleting student:', id)
      const { error } = await supabase.from("students").delete().eq("id", id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Student deleted successfully')
      toast.success("Student deleted successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error(`Failed to delete student: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  // CRUD operations for inventory
  const addInventoryItem = async (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("products").insert([item]).select()

      if (error) throw error
      if (data) {
        setInventory((prev) => [...prev, ...data])
        toast.success("Inventory item added successfully")
      }
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast.error("Failed to add inventory item")
    }
  }

  const updateInventoryItem = async (id: number, item: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase.from("products").update(item).eq("id", id).select()

      if (error) throw error
      if (data) {
        setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...data[0] } : i)))
        toast.success("Inventory item updated successfully")
      }
    } catch (error) {
      console.error("Error updating inventory item:", error)
      toast.error("Failed to update inventory item")
    }
  }

  const deleteInventoryItem = async (id: number) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
      setInventory((prev) => prev.filter((i) => i.id !== id))
      toast.success("Inventory item deleted successfully")
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      toast.error("Failed to delete inventory item")
    }
  }

  // CRUD operations for reviews
  const addReview = async (review: Omit<Review, "id" | "created_at" | "updated_at">) => {
    try {
      setSyncing(true)
      console.log('Adding review:', review)
      const { data, error } = await supabase.from("reviews").insert([review]).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Review added successfully:', data)
      toast.success("Review added successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setReviews(prev => {
          const exists = prev.find(r => r.id === data[0].id)
          if (exists) return prev
          return [...prev, ...data]
        })
      }
    } catch (error) {
      console.error("Error adding review:", error)
      toast.error(`Failed to add review: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const updateReview = async (id: number, review: Partial<Review>) => {
    try {
      setSyncing(true)
      console.log('Updating review:', id, review)
      const { data, error } = await supabase.from("reviews").update(review).eq("id", id).select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Review updated successfully:', data)
      toast.success("Review updated successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      if (data && data.length > 0) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, ...data[0] } : r))
      }
    } catch (error) {
      console.error("Error updating review:", error)
      toast.error(`Failed to update review: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const deleteReview = async (id: number) => {
    try {
      setSyncing(true)
      console.log('Deleting review:', id)
      const { error } = await supabase.from("reviews").delete().eq("id", id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Review deleted successfully')
      toast.success("Review deleted successfully")
      
      // Real-time subscription will handle the update automatically
      // But add fallback for immediate UI update
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error(`Failed to delete review: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setSyncing(false)
    }
  }

  const value: SupabaseDataContextType = {
    // Data
    customers,
    appointments,
    staff,
    services,
    courses,
    students,
    inventory,
    reviews,

    // Loading states
    loading,
    syncing,

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

    addCourse,
    updateCourse,
    deleteCourse,

    addStudent,
    updateStudent,
    deleteStudent,

    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,

    addReview,
    updateReview,
    deleteReview,

    // Sync operations
    syncFromSupabase,
    syncToSupabase,
    
    // Connection status
    connectionStatus,
  }

  return <SupabaseDataContext.Provider value={value}>{children}</SupabaseDataContext.Provider>
}

export function useSupabaseData() {
  const context = useContext(SupabaseDataContext)
  if (context === undefined) {
    throw new Error("useSupabaseData must be used within a SupabaseDataProvider")
  }
  return context
}
