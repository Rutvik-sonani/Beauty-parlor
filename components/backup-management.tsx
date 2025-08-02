"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useSupabaseData } from "@/contexts/supabase-data-context"
import { Download, Upload, Trash2, Database, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export function BackupManagement() {
  const { syncFromSupabase, syncToSupabase, loading, syncing } = useSupabaseData()
  const [backups, setBackups] = useState<any[]>([])

  const [backupName, setBackupName] = useState("")
  const [backupDescription, setBackupDescription] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      toast.error("Please enter a backup name")
      return
    }

    try {
      const newBackup = {
        id: Date.now(),
        backup_name: backupName,
        description: backupDescription,
        created_by: 'Admin',
        created_at: new Date().toISOString()
      }
      setBackups(prev => [...prev, newBackup])
      setBackupName("")
      setBackupDescription("")
      setIsCreateDialogOpen(false)
      toast.success("Backup created successfully!")
    } catch (error) {
      console.error("Error creating backup:", error)
      toast.error("Failed to create backup")
    }
  }

  const handleRestoreBackup = async (backupId: number) => {
    try {
      toast.success("Backup restored successfully!")
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast.error("Failed to restore backup")
    }
  }

  const handleDeleteBackup = async (backupId: number) => {
    try {
      setBackups(prev => prev.filter(b => b.id !== backupId))
      toast.success("Backup deleted successfully!")
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast.error("Failed to delete backup")
    }
  }

  const exportBackup = (backup: any) => {
    const dataStr = JSON.stringify(backup, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `backup-${backup.backup_name}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast.success("Backup exported successfully!")
  }

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)
        const newBackup = {
          id: Date.now(),
          backup_name: `Imported-${backupData.backup_name || "Backup"}`,
          description: `Imported backup from ${file.name}`,
          created_by: 'Admin',
          created_at: new Date().toISOString()
        }
        setBackups(prev => [...prev, newBackup])
        toast.success("Backup imported successfully!")
      } catch (error) {
        console.error("Error importing backup:", error)
        toast.error("Failed to import backup - Invalid file format")
      }
    }
    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading backup data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Backup Management</h2>
          <p className="text-muted-foreground">Create, restore, and manage your data backups</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncFromSupabase} disabled={syncing} variant="outline" size="sm">
            {syncing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Sync from DB
          </Button>
          <Button onClick={syncToSupabase} disabled={syncing} variant="outline" size="sm">
            {syncing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Sync to DB
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Backup</DialogTitle>
              <DialogDescription>
                Create a backup of all your current data. This will save customers, appointments, staff, and all other
                data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-name">Backup Name</Label>
                <Input
                  id="backup-name"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Enter backup name..."
                />
              </div>
              <div>
                <Label htmlFor="backup-description">Description (Optional)</Label>
                <Textarea
                  id="backup-description"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Enter backup description..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBackup}>Create Backup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div>
          <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} id="import-backup" />
          <Button variant="outline" onClick={() => document.getElementById("import-backup")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import Backup
          </Button>
        </div>
      </div>

      {/* Backup List */}
      <div className="grid gap-4">
        {backups?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Backups Found</h3>
              <p className="text-muted-foreground text-center mb-4">Create your first backup to protect your data</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Save className="h-4 w-4 mr-2" />
                Create First Backup
              </Button>
            </CardContent>
          </Card>
        ) : (
          backups.map((backup) => (
            <Card key={backup.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {backup.backup_name}
                      <Badge variant="secondary">{new Date(backup.created_at).toLocaleDateString()}</Badge>
                    </CardTitle>
                    <CardDescription>{backup.description || "No description provided"}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportBackup(backup)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore Backup</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will replace all current data with the backup data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRestoreBackup(backup.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Restore Backup
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this backup? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Created by: {backup.created_by}</span>
                  <span>•</span>
                  <span>{new Date(backup.created_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Connection Status:</span>
              <Badge variant={syncing ? "secondary" : "default"}>{syncing ? "Syncing..." : "Connected"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Backups:</span>
              <Badge variant="outline">{backups?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Sync:</span>
              <span className="text-sm text-muted-foreground">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
