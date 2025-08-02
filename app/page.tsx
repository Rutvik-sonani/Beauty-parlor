"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminPanel } from "@/components/admin-panel"
import { CustomerWebsite } from "@/components/customer-website"
import { useSupabaseData } from "@/contexts/supabase-data-context"

export default function Home() {
  const [currentView, setCurrentView] = useState<"website" | "login" | "admin">("website")
  const [userType, setUserType] = useState<"admin" | "staff">("admin")
  const [userData, setUserData] = useState<any>(null)

  // Restore admin session on page load
  useEffect(() => {
    const savedView = localStorage.getItem('currentView')
    const savedUserType = localStorage.getItem('userType')
    const savedUserData = localStorage.getItem('userData')
    
    if (savedView === 'admin' && savedUserType) {
      setCurrentView('admin')
      setUserType(savedUserType as 'admin' | 'staff')
      if (savedUserData) {
        setUserData(JSON.parse(savedUserData))
      }
    }
  }, [])

  const handleLoginSuccess = (type: "admin" | "staff", data?: any) => {
    setUserType(type)
    setUserData(data)
    setCurrentView("admin")
    
    // Save to localStorage
    localStorage.setItem('currentView', 'admin')
    localStorage.setItem('userType', type)
    if (data) {
      localStorage.setItem('userData', JSON.stringify(data))
    }
  }

  const handleLogout = () => {
    setUserType("admin")
    setUserData(null)
    setCurrentView("website")
    
    // Clear localStorage
    localStorage.removeItem('currentView')
    localStorage.removeItem('userType')
    localStorage.removeItem('userData')
    localStorage.removeItem('adminActiveTab')
  }

  const handleBackToWebsite = () => {
    setCurrentView("website")
  }

  const handleGoToLogin = () => {
    setCurrentView("login")
  }

  if (currentView === "login") {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onBackToWebsite={handleBackToWebsite} />
  }

  if (currentView === "admin") {
    return <AdminPanel onLogout={handleLogout} userType={userType} userData={userData} />
  }

  return <CustomerWebsite onAdminLogin={handleGoToLogin} />
}
