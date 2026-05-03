"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import type { ComponentProps } from "react"

type LogoutButtonProps = Omit<ComponentProps<typeof Button>, "children">

export function LogoutButton({ variant = "secondary", onClick, ...rest }: LogoutButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={(e) => {
        onClick?.(e)
        window.location.href = "/auth/signout"
      }}
      {...rest}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
