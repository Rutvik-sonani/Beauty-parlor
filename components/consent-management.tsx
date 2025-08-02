"use client"

export function ConsentManagement() {
  const consentForms = [
    {
      id: 1,
      name: "Chemical Peel Consent",
      service: "Facial Treatment",
      version: "v2.1",
      status: "Active",
      lastUpdated: "2024-01-10",
      signaturesCount: 45,
    },
    {
      id: 2,
      name: "Hair Color Treatment Consent",
      service: "Hair Coloring",
      version: "v1.8",
      status: "Active",
      lastUpdated: "2024-01-05",
      signaturesCount: 78,
    },
    {
      id: 3,
      name: "Laser Hair Removal Consent",
      service: "Laser Treatment",
      version: "v3.0",
      status: "Draft",
      lastUpdated: "2024-01-12",
      signaturesCount: 0,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Draft":
        return "bg-yellow-100 text-yellow-700"
      case "Archived":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Consent Management</h1>
        <p className="text-gray-600">Manage customer consent and privacy settings</p>
      </div>
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
        <p className="text-gray-500 text-lg">Coming Soon...</p>
      </div>
    </div>
  )
}
