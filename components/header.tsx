"use client"

import { Bell, Search, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-pink-100 bg-white/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-gray-600 hover:text-pink-600" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search customers, appointments..."
            className="w-80 pl-10 border-pink-200 focus:border-pink-400 rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl border-pink-200 hover:bg-pink-50">
              <MapPin className="h-4 w-4" />
              <span>Main Branch</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem>Main Branch</DropdownMenuItem>
            <DropdownMenuItem>Downtown Location</DropdownMenuItem>
            <DropdownMenuItem>Mall Branch</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="rounded-xl border-pink-200 hover:bg-pink-50">
          <Bell className="h-4 w-4" />
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">SA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
