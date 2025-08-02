"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  SettingsIcon,
  Users,
  Shield,
  Database,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Key,
} from "lucide-react"

interface StaffPermissions {
  canAddServices: boolean
  canAddCustomers: boolean
  canAddStudents: boolean
  canAddInventory: boolean
  canManageAppointments: boolean
  canViewFinancials: boolean
  canViewReports: boolean
  canManageSettings: boolean
}

interface StaffAccount {
  id: number
  name: string
  email: string
  role: string
  staffId: string
  password: string
  permissions: StaffPermissions
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

interface BusinessSettings {
  business_name: string
  business_phone: string
  business_address: string
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  strong_passwords: boolean
  two_factor_auth: boolean
  session_timeout: number
  auto_backups: boolean
  data_encryption: boolean
  audit_logging: boolean
}

const defaultPermissions: StaffPermissions = {
  canAddServices: false,
  canAddCustomers: true,
  canAddStudents: false,
  canAddInventory: false,
  canManageAppointments: true,
  canViewFinancials: false,
  canViewReports: false,
  canManageSettings: false,
}

// Generate staff ID and password
const generateStaffCredentials = () => {
  const staffId = `STAFF${Math.floor(1000 + Math.random() * 9000)}`
  const password = `${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`
  return { staffId, password }
}

export function Settings() {
  const { staff, syncing, syncFromSupabase, syncToSupabase, connectionStatus } = useSupabaseData()
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([])
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    business_name: "RBS Salon",
    business_phone: "+1 (555) 123-4567",
    business_address: "123 Beauty Street, Salon City, SC 12345",
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    strong_passwords: true,
    two_factor_auth: false,
    session_timeout: 30,
    auto_backups: true,
    data_encryption: true,
    audit_logging: true
  })
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null)
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true)
  const [autoSyncInterval, setAutoSyncInterval] = useState(30) // seconds
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Generate initial credentials
  const [staffCredentials, setStaffCredentials] = useState(() => generateStaffCredentials())

  // New staff form data
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "Staff",
    permissions: { ...defaultPermissions },
  })

  // Load staff accounts and business settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load business settings from database
        const { data: settingsData } = await supabase
          .from('business_settings')
          .select('*')
          .single()
        
        if (settingsData) {
          setBusinessSettings(settingsData)
        }

        // Load staff accounts from database
        const { data: staffData } = await supabase
          .from('staff_accounts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (staffData) {
          setStaffAccounts(staffData)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  // Save business settings to database
  const saveBusinessSettings = async (settings: Partial<BusinessSettings>) => {
    try {
      const { error } = await supabase
        .from('business_settings')
        .upsert([{ id: 1, ...settings }])
      
      if (error) throw error
      
      setBusinessSettings(prev => ({ ...prev, ...settings }))
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    }
  }

  // Live updates setup
  useEffect(() => {
    if (!liveUpdatesEnabled) return

    const interval = setInterval(async () => {
      try {
        await syncFromSupabase()
        setLastSyncTime(new Date())
      } catch (error) {
        console.error("Auto-sync failed:", error)
      }
    }, autoSyncInterval * 1000)

    return () => clearInterval(interval)
  }, [liveUpdatesEnabled, autoSyncInterval, syncFromSupabase])

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const staffAccount = {
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        staff_id: staffCredentials.staffId,
        password: staffCredentials.password,
        permissions: newStaff.permissions,
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('staff_accounts')
        .insert([staffAccount])
        .select()

      if (error) throw error

      setStaffAccounts((prev) => [...prev, data[0]])
      setNewStaff({
        name: "",
        email: "",
        role: "Staff",
        permissions: { ...defaultPermissions },
      })
      setStaffCredentials(generateStaffCredentials())
      setIsAddingStaff(false)
      toast.success("Staff account created successfully")
    } catch (error) {
      console.error("Error creating staff account:", error)
      toast.error("Failed to create staff account")
    }
  }

  const handleUpdateStaff = async (updatedStaff: StaffAccount) => {
    try {
      const { error } = await supabase
        .from('staff_accounts')
        .update({
          name: updatedStaff.name,
          role: updatedStaff.role,
          permissions: updatedStaff.permissions,
        })
        .eq('id', updatedStaff.id)

      if (error) throw error

      setStaffAccounts((prev) => prev.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff)))
      setEditingStaff(null)
      toast.success("Staff permissions updated successfully")
    } catch (error) {
      console.error("Error updating staff:", error)
      toast.error("Failed to update staff permissions")
    }
  }

  const handleDeleteStaff = async (staffId: number) => {
    try {
      const { error } = await supabase
        .from('staff_accounts')
        .delete()
        .eq('id', staffId)

      if (error) throw error

      setStaffAccounts((prev) => prev.filter((staff) => staff.id !== staffId))
      toast.success("Staff account deleted successfully")
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast.error("Failed to delete staff account")
    }
  }

  const handleToggleStaffStatus = async (staffId: number) => {
    try {
      const currentStaff = staffAccounts.find(staff => staff.id === staffId)
      if (!currentStaff) return

      const { error } = await supabase
        .from('staff_accounts')
        .update({ is_active: !currentStaff.isActive })
        .eq('id', staffId)

      if (error) throw error

      setStaffAccounts((prev) =>
        prev.map((staff) => (staff.id === staffId ? { ...staff, isActive: !staff.isActive } : staff)),
      )
      toast.success(`Staff ${currentStaff.isActive ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      console.error("Error toggling staff status:", error)
      toast.error("Failed to update staff status")
    }
  }

  const handleManualSync = async () => {
    try {
      await syncToSupabase()
      await syncFromSupabase()
      setLastSyncTime(new Date())
      toast.success("Data synchronized successfully")
    } catch (error) {
      toast.error("Sync failed. Please try again.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings & Security
          </h1>
          <p className="text-gray-600">Configure system settings and manage staff access</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSyncTime && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={handleManualSync} disabled={syncing} variant="outline" size="sm">
            {syncing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Now
          </Button>
        </div>
      </div>

      <Tabs defaultValue="staff-access" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff-access">Staff Access</TabsTrigger>
          <TabsTrigger value="live-updates">Live Updates</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="staff-access" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Access Management
                  </CardTitle>
                  <CardDescription>Control what staff members can access and modify in the system</CardDescription>
                </div>
                <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Staff Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>Create New Staff Account</DialogTitle>
                      <DialogDescription>Set up a new staff account with specific permissions</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-1">
                      <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={newStaff.name}
                              onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newStaff.email}
                              onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter email address"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newStaff.role}
                            onValueChange={(value) => setNewStaff((prev) => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Staff">Staff</SelectItem>
                              <SelectItem value="Senior Staff">Senior Staff</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Receptionist">Receptionist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Auto-generated Credentials */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Key className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium text-blue-800">Auto-Generated Credentials</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-blue-700">Staff ID</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={staffCredentials.staffId} readOnly className="bg-white border-blue-200" />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(staffCredentials.staffId)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-blue-700">Password</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  value={staffCredentials.password}
                                  readOnly
                                  className="bg-white border-blue-200"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(staffCredentials.password)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            💡 These credentials will be used by the staff member to login. Make sure to share them
                            securely.
                          </p>
                        </div>

                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3">Permissions</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Add Services</Label>
                                <p className="text-sm text-gray-500">Can create and modify services</p>
                              </div>
                              <Switch
                                checked={newStaff.permissions.canAddServices}
                                onCheckedChange={(checked) =>
                                  setNewStaff((prev) => ({
                                    ...prev,
                                    permissions: { ...prev.permissions, canAddServices: checked },
                                  }))
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Add Customers</Label>
                                <p className="text-sm text-gray-500">Can add and edit customer information</p>
                              </div>
                              <Switch
                                checked={newStaff.permissions.canAddCustomers}
                                onCheckedChange={(checked) =>
                                  setNewStaff((prev) => ({
                                    ...prev,
                                    permissions: { ...prev.permissions, canAddCustomers: checked },
                                  }))
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Add Students</Label>
                                <p className="text-sm text-gray-500">Can enroll and manage students</p>
                              </div>
                              <Switch
                                checked={newStaff.permissions.canAddStudents}
                                onCheckedChange={(checked) =>
                                  setNewStaff((prev) => ({
                                    ...prev,
                                    permissions: { ...prev.permissions, canAddStudents: checked },
                                  }))
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Manage Inventory</Label>
                                <p className="text-sm text-gray-500">Can add and update inventory products</p>
                              </div>
                              <Switch
                                checked={newStaff.permissions.canAddInventory}
                                onCheckedChange={(checked) =>
                                  setNewStaff((prev) => ({
                                    ...prev,
                                    permissions: { ...prev.permissions, canAddInventory: checked },
                                  }))
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Manage Appointments</Label>
                                <p className="text-sm text-gray-500">Can book and modify appointments</p>
                              </div>
                              <Switch
                                checked={newStaff.permissions.canManageAppointments}
                                onCheckedChange={(checked) =>
                                  setNewStaff((prev) => ({
                                    ...prev,
                                    permissions: { ...prev.permissions, canManageAppointments: checked },
                                  }))
                                }
                              />
                            </div>
                            <Separator />
                            <div className="bg-red-50 p-3 rounded-lg">
                              <h5 className="font-medium text-red-800 mb-2">Restricted Access</h5>
                              <div className="space-y-2 text-sm text-red-700">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4" />
                                  Financial data and income reports are hidden from staff
                                </div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4" />
                                  POS system money flow is not accessible
                                </div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4" />
                                  Revenue analytics and profit margins are restricted
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="flex-shrink-0 border-t pt-4">
                      <Button variant="outline" onClick={() => setIsAddingStaff(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStaff}>Create Account</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No staff accounts created yet</p>
                    <p className="text-sm">Create staff accounts to manage access permissions</p>
                  </div>
                ) : (
                  staffAccounts.map((staffAccount) => (
                    <Card key={staffAccount.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {staffAccount.name}
                                <Badge variant={staffAccount.isActive ? "default" : "secondary"}>
                                  {staffAccount.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </h4>
                              <p className="text-sm text-gray-500">
                                {staffAccount.email} • {staffAccount.role}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">ID:</span> {staffAccount.staffId}
                                </div>
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Password:</span> {staffAccount.password}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                {staffAccount.permissions.canAddServices && (
                                  <Badge variant="outline" className="text-xs">
                                    Services
                                  </Badge>
                                )}
                                {staffAccount.permissions.canAddCustomers && (
                                  <Badge variant="outline" className="text-xs">
                                    Customers
                                  </Badge>
                                )}
                                {staffAccount.permissions.canAddStudents && (
                                  <Badge variant="outline" className="text-xs">
                                    Students
                                  </Badge>
                                )}
                                {staffAccount.permissions.canAddInventory && (
                                  <Badge variant="outline" className="text-xs">
                                    Inventory
                                  </Badge>
                                )}
                                {staffAccount.permissions.canManageAppointments && (
                                  <Badge variant="outline" className="text-xs">
                                    Appointments
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStaffStatus(staffAccount.id)}
                            >
                              {staffAccount.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingStaff(staffAccount)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Staff Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {staffAccount.name}'s account? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStaff(staffAccount.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Live Data Updates
              </CardTitle>
              <CardDescription>Configure real-time data synchronization with Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Live Updates</Label>
                  <p className="text-sm text-gray-500">Automatically sync data with the database</p>
                </div>
                <Switch checked={liveUpdatesEnabled} onCheckedChange={setLiveUpdatesEnabled} />
              </div>

              {liveUpdatesEnabled && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label htmlFor="sync-interval">Auto-sync Interval (seconds)</Label>
                    <Select
                      value={autoSyncInterval.toString()}
                      onValueChange={(value) => setAutoSyncInterval(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Real-time Features</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Instant appointment updates</li>
                          <li>• Live customer data sync</li>
                          <li>• Real-time inventory tracking</li>
                          <li>• Automatic backup creation</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Sync Status</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={
                              connectionStatus === 'connected' ? 'default' :
                              connectionStatus === 'connecting' ? 'secondary' :
                              'destructive'
                            }>
                              {connectionStatus === 'connected' ? 'Connected' :
                               connectionStatus === 'connecting' ? 'Connecting...' :
                               'Disconnected'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Sync:</span>
                            <span className="text-gray-600">
                              {lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Never"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Sync:</span>
                            <span className="text-gray-600">
                              {liveUpdatesEnabled ? `${autoSyncInterval}s` : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Manual Sync Controls</h4>
                <div className="flex gap-2">
                  <Button onClick={handleManualSync} disabled={syncing}>
                    {syncing ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                  <Button variant="outline" onClick={syncFromSupabase} disabled={syncing}>
                    <Database className="h-4 w-4 mr-2" />
                    Pull from Database
                  </Button>
                  <Button variant="outline" onClick={syncToSupabase} disabled={syncing}>
                    <Save className="h-4 w-4 mr-2" />
                    Push to Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>General system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input 
                    id="business-name" 
                    value={businessSettings.business_name}
                    onChange={(e) => saveBusinessSettings({ business_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="business-phone">Business Phone</Label>
                  <Input 
                    id="business-phone" 
                    value={businessSettings.business_phone}
                    onChange={(e) => saveBusinessSettings({ business_phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea 
                  id="business-address" 
                  value={businessSettings.business_address}
                  onChange={(e) => saveBusinessSettings({ business_address: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                    </div>
                    <Switch 
                      checked={businessSettings.email_notifications}
                      onCheckedChange={(checked) => saveBusinessSettings({ email_notifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive SMS alerts for urgent matters</p>
                    </div>
                    <Switch 
                      checked={businessSettings.sms_notifications}
                      onCheckedChange={(checked) => saveBusinessSettings({ sms_notifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Browser push notifications</p>
                    </div>
                    <Switch 
                      checked={businessSettings.push_notifications}
                      onCheckedChange={(checked) => saveBusinessSettings({ push_notifications: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Password Policy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Strong Passwords</Label>
                      <p className="text-sm text-gray-500">Minimum 8 characters with special characters</p>
                    </div>
                    <Switch 
                      checked={businessSettings.strong_passwords}
                      onCheckedChange={(checked) => saveBusinessSettings({ strong_passwords: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <Switch 
                      checked={businessSettings.two_factor_auth}
                      onCheckedChange={(checked) => saveBusinessSettings({ two_factor_auth: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                    </div>
                    <Select 
                      value={businessSettings.session_timeout.toString()}
                      onValueChange={(value) => saveBusinessSettings({ session_timeout: parseInt(value) })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Protection</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-gray-500">Daily automated data backups</p>
                    </div>
                    <Switch 
                      checked={businessSettings.auto_backups}
                      onCheckedChange={(checked) => saveBusinessSettings({ auto_backups: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Encryption</Label>
                      <p className="text-sm text-gray-500">Encrypt sensitive customer data</p>
                    </div>
                    <Switch 
                      checked={businessSettings.data_encryption}
                      onCheckedChange={(checked) => saveBusinessSettings({ data_encryption: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-gray-500">Log all system activities</p>
                    </div>
                    <Switch 
                      checked={businessSettings.audit_logging}
                      onCheckedChange={(checked) => saveBusinessSettings({ audit_logging: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Staff Dialog */}
      {editingStaff && (
        <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Staff Permissions</DialogTitle>
              <DialogDescription>Update permissions for {editingStaff.name}</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-1">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editingStaff.name}
                      onChange={(e) => setEditingStaff((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={editingStaff.role}
                      onValueChange={(value) => setEditingStaff((prev) => (prev ? { ...prev, role: value } : null))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Senior Staff">Senior Staff</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Receptionist">Receptionist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-sm text-blue-700">Staff ID</Label>
                      <p className="font-mono text-sm">{editingStaff.staffId}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-blue-700">Password</Label>
                      <p className="font-mono text-sm">{editingStaff.password}</p>
                    </div>
                  </div>
                </div>

                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Permissions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Add Services</Label>
                        <p className="text-sm text-gray-500">Can create and modify services</p>
                      </div>
                      <Switch
                        checked={editingStaff.permissions.canAddServices}
                        onCheckedChange={(checked) =>
                          setEditingStaff((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: { ...prev.permissions, canAddServices: checked },
                                }
                              : null,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Add Customers</Label>
                        <p className="text-sm text-gray-500">Can add and edit customer information</p>
                      </div>
                      <Switch
                        checked={editingStaff.permissions.canAddCustomers}
                        onCheckedChange={(checked) =>
                          setEditingStaff((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: { ...prev.permissions, canAddCustomers: checked },
                                }
                              : null,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Add Students</Label>
                        <p className="text-sm text-gray-500">Can enroll and manage students</p>
                      </div>
                      <Switch
                        checked={editingStaff.permissions.canAddStudents}
                        onCheckedChange={(checked) =>
                          setEditingStaff((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: { ...prev.permissions, canAddStudents: checked },
                                }
                              : null,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Manage Inventory</Label>
                        <p className="text-sm text-gray-500">Can add and update inventory products</p>
                      </div>
                      <Switch
                        checked={editingStaff.permissions.canAddInventory}
                        onCheckedChange={(checked) =>
                          setEditingStaff((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: { ...prev.permissions, canAddInventory: checked },
                                }
                              : null,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Manage Appointments</Label>
                        <p className="text-sm text-gray-500">Can book and modify appointments</p>
                      </div>
                      <Switch
                        checked={editingStaff.permissions.canManageAppointments}
                        onCheckedChange={(checked) =>
                          setEditingStaff((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permissions: { ...prev.permissions, canManageAppointments: checked },
                                }
                              : null,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 border-t pt-4">
              <Button variant="outline" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingStaff && handleUpdateStaff(editingStaff)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
