"use client"

import React from "react"
import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar
          size="sm"
          className="cursor-pointer ring-2 ring-transparent transition-all hover:ring-accent focus-visible:ring-accent touch-target"
        >
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? "Usuário"} />
          <AvatarFallback className="bg-accent text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        {user && (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {user.name ?? "Usuário"}
                </span>
                {user.email && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {user.email}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={() => {
            // Navigate to account page — implement when route exists
          }}
        >
          <User className="size-4" />
          Minha Conta
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            // Dynamically import the logout action
            const { logout } = await import("@/lib/auth-actions");
            await logout();
          }}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
