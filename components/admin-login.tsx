"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, EyeOff, Sparkles, Users, Shield } from "lucide-react"

interface AdminLoginProps {
  onLoginSuccess: (userType: "admin" | "staff", userData?: any) => void
  onBackToWebsite: () => void
}

export function AdminLogin({ onLoginSuccess, onBackToWebsite }: AdminLoginProps) {
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" })
  const [staffCredentials, setStaffCredentials] = useState({ staffId: "", password: "" })
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("admin")

  // Mock staff data - in real app, this would come from database
  const mockStaffAccounts = [
    {
      id: "STAFF1234",
      password: "ABC123XY45",
      name: "Sarah Johnson",
      role: "Senior Stylist",
      permissions: ["appointments", "customers", "pos"],
    },
    {
      id: "STAFF5678",
      password: "DEF456ZW78",
      name: "Mike Chen",
      role: "Receptionist",
      permissions: ["appointments", "customers"],
    },
  ]

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (adminCredentials.username === "admin" && adminCredentials.password === "admin123") {
      onLoginSuccess("admin")
    } else {
      setError("Invalid admin credentials")
    }
    setIsLoading(false)
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const staff = mockStaffAccounts.find(
      (s) => s.id === staffCredentials.staffId && s.password === staffCredentials.password,
    )

    if (staff) {
      onLoginSuccess("staff", staff)
    } else {
      setError("Invalid staff credentials")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 text-white">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">BeautyPro Login</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        <Card className="rounded-2xl border-pink-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Login Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Staff
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Admin Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                      className="rounded-xl"
                      placeholder="Enter admin username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                        className="rounded-xl pr-10"
                        placeholder="Enter admin password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 text-center">
                    Demo Admin Credentials:
                    <br />
                    Username: <strong>admin</strong>
                    <br />
                    Password: <strong>admin123</strong>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="staff">
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-id">Staff ID</Label>
                    <Input
                      id="staff-id"
                      type="text"
                      value={staffCredentials.staffId}
                      onChange={(e) => setStaffCredentials({ ...staffCredentials, staffId: e.target.value })}
                      className="rounded-xl"
                      placeholder="Enter your staff ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-password">Staff Password</Label>
                    <div className="relative">
                      <Input
                        id="staff-password"
                        type={showStaffPassword ? "text" : "password"}
                        value={staffCredentials.password}
                        onChange={(e) => setStaffCredentials({ ...staffCredentials, password: e.target.value })}
                        className="rounded-xl pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                      >
                        {showStaffPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Staff"}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700 text-center font-medium mb-2">Demo Staff Credentials:</p>
                  <div className="space-y-2 text-xs text-blue-600">
                    <div className="bg-white p-2 rounded border">
                      <strong>Sarah Johnson (Senior Stylist)</strong>
                      <br />
                      ID: <strong>STAFF1234</strong> | Pass: <strong>ABC123XY45</strong>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Mike Chen (Receptionist)</strong>
                      <br />
                      ID: <strong>STAFF5678</strong> | Pass: <strong>DEF456ZW78</strong>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="border-red-200 bg-red-50 mt-4">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onBackToWebsite}
                className="w-full rounded-xl border-pink-200 hover:bg-pink-50 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
