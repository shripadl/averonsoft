"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = "/auth/signout"
  }

  return (
    <Button variant="secondary" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
