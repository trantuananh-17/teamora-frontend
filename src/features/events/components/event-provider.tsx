"use client"

import { createContext, useContext } from "react"

import type { EmployeeSelf } from "@/features/employees/service/employees.service"
import type { Registration } from "@/features/registration/service/registration.service"
import type { Event } from "../service/events.service"

interface EventContextValue {
  event: Event | null
  registration: Registration | null
  employee: EmployeeSelf
}

const EventContext = createContext<EventContextValue | null>(null)

export function EventProvider({
  value,
  children,
}: {
  value: EventContextValue
  children: React.ReactNode
}) {
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>
}

export function useEventContext(): EventContextValue {
  const value = useContext(EventContext)
  if (!value) throw new Error("useEventContext must be used within EventProvider")
  return value
}
