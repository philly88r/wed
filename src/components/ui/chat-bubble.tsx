"use client"

import React from "react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"
import { MessageLoading } from "./message-loading";

interface ChatBubbleProps {
  variant?: "sent" | "received"
  children: React.ReactNode
  className?: string
}

export function ChatBubble({
  variant = "received",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
        variant === "received"
          ? "ml-0 mr-auto bg-muted text-muted-foreground"
          : "ml-auto mr-0 bg-primary text-primary-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ChatBubbleMessageProps {
  children?: React.ReactNode
  variant?: "sent" | "received"
  isLoading?: boolean
}

export function ChatBubbleMessage({
  children,
  variant = "received",
  isLoading,
}: ChatBubbleMessageProps) {
  if (isLoading) {
    return (
      <div className="flex h-6 items-center">
        <div className="flex space-x-1">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          <div
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "text-sm",
        variant === "received" ? "text-muted-foreground" : "text-primary-foreground"
      )}
    >
      {children}
    </div>
  )
}

interface ChatBubbleAvatarProps {
  src?: string
  fallback: string
  className?: string
}

export function ChatBubbleAvatar({
  src,
  fallback,
  className,
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} /> : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

interface ChatBubbleActionProps {
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ChatBubbleAction({
  icon,
  onClick,
  className,
}: ChatBubbleActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}

export function ChatBubbleActionWrapper({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-1 mt-2", className)}>
      {children}
    </div>
  )
}
