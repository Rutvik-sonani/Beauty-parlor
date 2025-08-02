"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { Appointments } from "@/components/appointments"
import { POS } from "@/components/pos"
import { Customers } from "@/components/customers"
import { Staff } from "@/components/staff"
import { Courses } from "@/components/courses"
import { Students } from "@/components/students"
import { Inventory } from "@/components/inventory"
import { ServiceManagement } from "@/components/service-management"
import { WebsiteManagement } from "@/components/website-management"
import { CustomerReviews } from "@/components/customer-reviews"
import { LoyaltyRewards } from "@/components/loyalty-rewards"
import { GiftVouchers } from "@/components/gift-vouchers"
import { Marketing } from "@/components/marketing"
import { Reports } from "@/components/reports"
import { ConsentManagement } from "@/components/consent-management"
import { MultiLocation } from "@/components/multi-location"
import { BackupManagement } from "@/components/backup-management"
import { Settings } from "@/components/settings"
import { WebsiteBookings } from "@/components/website-bookings"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { RefreshCw, LogOut, User, Shield, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminPanelProps {
  onLogout: () => void
  userType: "admin" | "staff"
  userData?: any
}

export function AdminPanel({ onLogout, userType, userData }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { syncing, loading } = useSupabaseData()

  // Persist active tab in localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    localStorage.setItem('adminActiveTab', tab)
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      onLogout()
    }
  }

  const getUserDisplayName = () => {
    if (userType === "admin") {
      return "Administrator"
    }
    return userData?.name || "Staff Member"
  }

  const getUserRole = () => {
    if (userType === "admin") {
      return "System Administrator"
    }
    return userData?.role || "Staff"
  }

  const getUserInitials = () => {
    if (userType === "admin") {
      return "AD"
    }
    const name = userData?.name || "Staff"
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Filter available tabs based on user permissions
  const getAvailableTabs = () => {
    if (userType === "admin") {
      return [
        "dashboard",
        "appointments",
        "bookings",
        "pos",
        "customers",
        "staff",
        "courses",
        "students",
        "inventory",
        "services",
        "website",
        "reviews",
        "loyalty",
        "vouchers",
        "marketing",
        "reports",
        "consent",
        "locations",
        "backup",
        "settings",
      ]
    }

    // Staff permissions
    const permissions = userData?.permissions || []
    const availableTabs = ["dashboard"] // Dashboard always available

    if (permissions.includes("appointments")) availableTabs.push("appointments")
    if (permissions.includes("pos")) availableTabs.push("pos")
    if (permissions.includes("customers")) availableTabs.push("customers")
    if (permissions.includes("inventory")) availableTabs.push("inventory")
    if (permissions.includes("services")) availableTabs.push("services")
    if (permissions.includes("website")) availableTabs.push("website")
    if (permissions.includes("reviews")) availableTabs.push("reviews")

    return availableTabs
  }

  const renderContent = () => {
    const availableTabs = getAvailableTabs()

    // Check if current tab is available for this user
    if (!availableTabs.includes(activeTab)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Restricted</h3>
            <p className="text-gray-500">You don't have permission to access this section.</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "appointments":
        return <Appointments />
      case "bookings":
        return <WebsiteBookings />
      case "pos":
        return <POS />
      case "customers":
        return <Customers />
      case "staff":
        return <Staff />
      case "courses":
        return <Courses />
      case "students":
        return <Students />
      case "inventory":
        return <Inventory />
      case "services":
        return <ServiceManagement />
      case "website":
        return <WebsiteManagement />
      case "reviews":
        return <CustomerReviews />
      case "loyalty":
        return <LoyaltyRewards />
      case "vouchers":
        return <GiftVouchers />
      case "marketing":
        return <Marketing />
      case "reports":
        return <Reports />
      case "consent":
        return <ConsentManagement />
      case "locations":
        return <MultiLocation />
      case "backup":
        return <BackupManagement />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          userType={userType}
          availableTabs={getAvailableTabs()}
        />
        <main className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b bg-white">
            <SidebarTrigger />
            <div className="flex-1" />

            {(syncing || loading) && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mr-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {loading ? 'Loading data...' : 'Syncing with database...'}
              </div>
            )}

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt={getUserDisplayName()} />
                    <AvatarFallback
                      className={`${
                        userType === "admin"
                          ? "bg-gradient-to-br from-pink-400 to-purple-500"
                          : "bg-gradient-to-br from-blue-400 to-indigo-500"
                      } text-white font-semibold`}
                    >
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      {userType === "admin" ? (
                        <Shield className="h-4 w-4 text-pink-500" />
                      ) : (
                        <Users className="h-4 w-4 text-blue-500" />
                      )}
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{getUserRole()}</p>
                    {userType === "staff" && userData?.id && (
                      <p className="text-xs leading-none text-muted-foreground">ID: {userData.id}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleTabChange('settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="p-6 overflow-auto h-[calc(100vh-73px)]">{renderContent()}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
