"use client"

export function MultiLocation() {
  const locations = [
    {
      id: 1,
      name: "Main Branch",
      address: "123 Beauty Street, Downtown",
      phone: "+91 98765-43210",
      manager: "Emma Wilson",
      staff: 8,
      monthlyRevenue: 185000,
      appointments: 156,
      status: "Active",
    },
    {
      id: 2,
      name: "Mall Branch",
      address: "City Mall, 2nd Floor, Shop 45",
      phone: "+91 98765-43211",
      manager: "Sophia Brown",
      staff: 5,
      monthlyRevenue: 125000,
      appointments: 98,
      status: "Active",
    },
    {
      id: 3,
      name: "Downtown Location",
      address: "456 Fashion Avenue, Central District",
      phone: "+91 98765-43212",
      manager: "Olivia Taylor",
      staff: 6,
      monthlyRevenue: 145000,
      appointments: 112,
      status: "Active",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Inactive":
        return "bg-red-100 text-red-700"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Multi-Location Management</h1>
        <p className="text-gray-600">Manage multiple salon locations</p>
      </div>
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
        <p className="text-gray-500 text-lg">Coming Soon...</p>
      </div>
    </div>
  )
}
