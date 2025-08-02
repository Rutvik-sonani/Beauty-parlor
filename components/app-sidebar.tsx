"use client"

import {
  Calendar,
  Users,
  ShoppingCart,
  UserCheck,
  GraduationCap,
  UserPlus,
  Package,
  Wrench,
  Star,
  Gift,
  Megaphone,
  BarChart3,
  Shield,
  MapPin,
  Database,
  Settings,
  LayoutDashboard,
  Globe,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  userType: "admin" | "staff"
  availableTabs: string[]
}

export function AppSidebar({ activeTab, setActiveTab, userType, availableTabs }: AppSidebarProps) {
  const allMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
      group: "Overview",
    },
    {
      title: "Appointments",
      icon: Calendar,
      id: "appointments",
      group: "Operations",
    },
    {
      title: "Point of Sale",
      icon: ShoppingCart,
      id: "pos",
      group: "Operations",
    },
    {
      title: "Customers",
      icon: Users,
      id: "customers",
      group: "Management",
    },
    {
      title: "Staff",
      icon: UserCheck,
      id: "staff",
      group: "Management",
    },
    {
      title: "Courses",
      icon: GraduationCap,
      id: "courses",
      group: "Education",
    },
    {
      title: "Students",
      icon: UserPlus,
      id: "students",
      group: "Education",
    },
    {
      title: "Inventory",
      icon: Package,
      id: "inventory",
      group: "Management",
    },
    {
      title: "Services",
      icon: Wrench,
      id: "services",
      group: "Management",
    },
    {
      title: "Website Management",
      icon: Globe,
      id: "website",
      group: "Website",
    },
    {
      title: "Reviews",
      icon: Star,
      id: "reviews",
      group: "Customer Experience",
    },
    {
      title: "Loyalty & Rewards",
      icon: Gift,
      id: "loyalty",
      group: "Customer Experience",
    },
    {
      title: "Gift Vouchers",
      icon: Gift,
      id: "vouchers",
      group: "Customer Experience",
    },
    {
      title: "Marketing",
      icon: Megaphone,
      id: "marketing",
      group: "Business Growth",
    },
    {
      title: "Reports & Analytics",
      icon: BarChart3,
      id: "reports",
      group: "Business Growth",
    },
    {
      title: "Consent Management",
      icon: Shield,
      id: "consent",
      group: "Compliance",
    },
    {
      title: "Multi-Location",
      icon: MapPin,
      id: "locations",
      group: "Enterprise",
    },
    {
      title: "Backup & Recovery",
      icon: Database,
      id: "backup",
      group: "System",
    },
    {
      title: "Settings & Security",
      icon: Settings,
      id: "settings",
      group: "System",
    },
  ]

  // Filter menu items based on available tabs
  const menuItems = allMenuItems.filter((item) => availableTabs.includes(item.id))

  // Group menu items
  const groupedItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, typeof menuItems>,
  )

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                userType === "admin"
                  ? "bg-gradient-to-br from-pink-400 to-purple-500"
                  : "bg-gradient-to-br from-blue-400 to-indigo-500"
              } text-white text-sm font-bold`}
            >
              {userType === "admin" ? "BP" : "ST"}
            </div>
            <div>
              <h2 className="text-lg font-semibold">BeautyPro</h2>
              <p className="text-xs text-muted-foreground">{userType === "admin" ? "Admin Panel" : "Staff Portal"}</p>
            </div>
          </div>
        </div>

        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTab(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {userType === "staff" && (
          <div className="mt-auto p-4 border-t bg-blue-50">
            <div className="text-xs text-blue-600 text-center">
              <p className="font-medium">Staff Access</p>
              <p>Limited permissions applied</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
