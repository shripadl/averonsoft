"use client"

import { useState } from "react"
import { LogOut, Settings, User, CreditCard, Trash } from "lucide-react"
import { LogoutButton } from "@/app/components/LogoutButton"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        <User className="h-4 w-4" />
        {email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg">
          <div className="p-2 text-sm text-muted-foreground border-b">
            Signed in as <br />
            <span className="font-medium text-foreground">{email}</span>
          </div>

          <div className="p-1">
            <Link href="/account">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </Link>

            <Link href="/account/billing">
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </Link>

            <Link href="/account/delete">
              <Button variant="ghost" className="w-full justify-start text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </Link>
          </div>

          <div className="border-t p-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}
