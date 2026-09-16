"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiErrorBody, errorMessage } from "@/lib/api-error"
import { registrationKeys } from "@/features/registration/options/registration.options"
import {
  galaKeys,
  galaSeatsOptions,
  galaSessionOptions,
  galaTablesOptions,
} from "../options/gala.options"
import {
  confirmGalaSeats,
  createGalaTable,
  deleteGalaAssignment,
  deleteGalaTable,
  holdGalaSeats,
  releaseGalaSeats,
  runGalaSessionAction,
  setTeamLeader,
  updateGalaSeat,
  updateGalaTable,
  upsertGalaSession,
  type GalaSeat,
  type GalaSessionAction,
  type GalaTableInput,
  type SeatSelectionInput,
} from "../service/gala.service"

export const useGalaTables = (eventId: string) => useSuspenseQuery(galaTablesOptions(eventId))
export const useGalaSession = (eventId: string) => useSuspenseQuery(galaSessionOptions(eventId))

/** `live` comes from the session query — seats only poll while a turn is running. */
export const useGalaSeats = (eventId: string, live: boolean) =>
  useSuspenseQuery({ ...galaSeatsOptions(eventId), refetchInterval: live ? 2000 : false })

/**
 * Seconds left in the current turn. The browser clock is not trusted on its
 * own: `serverNow` against the query's `dataUpdatedAt` (the local clock when
 * that response landed) gives the offset, re-derived on every poll; the 1s tick
 * only animates between polls.
 */
export function useTurnCountdown(view: {
  turnEndsAt: string | null
  serverNow: string
  dataUpdatedAt: number
}): number | null {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!view.turnEndsAt) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [view.turnEndsAt])
  if (!view.turnEndsAt) return null
  const offset = Date.parse(view.serverNow) - view.dataUpdatedAt
  return Math.max(0, Math.ceil((Date.parse(view.turnEndsAt) - (now + offset)) / 1000))
}

function useGalaMutation<T, R>(
  eventId: string,
  mutationFn: (input: T) => Promise<R>,
  success: string | null,
  onDone?: (result: R) => void,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (result) => {
      if (success) toast.success(success)
      await client.invalidateQueries({ queryKey: galaKeys.event(eventId) })
      onDone?.(result)
    },
    onError: async (error) =>
      toast.error("Không thực hiện được", { description: await errorMessage(error) }),
  })
}

export const useCreateGalaTable = (eventId: string, onDone?: () => void) =>
  useGalaMutation<GalaTableInput, unknown>(
    eventId,
    (input) => createGalaTable(eventId, input),
    "Đã thêm bàn",
    onDone,
  )
export const useUpdateGalaTable = (eventId: string, onDone?: () => void) =>
  useGalaMutation<
    { tableId: string; input: Partial<GalaTableInput & { active: boolean }> },
    unknown
  >(
    eventId,
    ({ tableId, input }) => updateGalaTable(eventId, tableId, input),
    "Đã cập nhật bàn",
    onDone,
  )
export const useDeleteGalaTable = (eventId: string, onDone?: () => void) =>
  useGalaMutation<string, void>(
    eventId,
    (tableId) => deleteGalaTable(eventId, tableId),
    "Đã xóa bàn",
    onDone,
  )
export const useUpdateGalaSeat = (eventId: string) =>
  useGalaMutation<{ seatId: string; status: GalaSeat["status"] }, unknown>(
    eventId,
    ({ seatId, status }) => updateGalaSeat(eventId, seatId, status),
    null,
  )

export const useUpsertGalaSession = (eventId: string) =>
  useGalaMutation<number, unknown>(
    eventId,
    (turnSeconds) => upsertGalaSession(eventId, turnSeconds),
    "Đã lưu thời gian mỗi lượt",
  )

const SESSION_ACTION_DONE: Record<GalaSessionAction, string> = {
  draw: "Đã bốc thăm thứ tự",
  start: "Đã bắt đầu phiên chọn ghế",
  skip: "Đã bỏ qua lượt",
  complete: "Đã kết thúc phiên chọn ghế",
}
export const useGalaSessionAction = (eventId: string, action: GalaSessionAction) =>
  useGalaMutation<void, unknown>(
    eventId,
    () => runGalaSessionAction(eventId, action),
    SESSION_ACTION_DONE[action],
  )

/**
 * Two teams clicking one seat: the loser gets `gala.seat_taken` from the unique
 * index. That is a normal outcome of a live session, not a fault — the toast
 * says what happened and the map refreshes to show who has it.
 */
export function useHoldGalaSeats(eventId: string, onDone?: () => void) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SeatSelectionInput) => holdGalaSeats(eventId, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: galaKeys.event(eventId) })
      onDone?.()
    },
    onError: async (error) => {
      const body = await apiErrorBody(error)
      if (body?.error?.message === "gala.seat_taken") {
        const details = body.error.details as { message?: string } | undefined
        toast.error("Ghế vừa bị Team khác giữ", { description: details?.message })
        await client.invalidateQueries({ queryKey: galaKeys.seats(eventId) })
        return
      }
      toast.error("Không giữ được ghế", { description: await errorMessage(error) })
    },
  })
}

export const useReleaseGalaSeats = (eventId: string) =>
  useGalaMutation<SeatSelectionInput, unknown>(
    eventId,
    (input) => releaseGalaSeats(eventId, input),
    null,
  )
export const useConfirmGalaSeats = (eventId: string, onDone?: () => void) =>
  useGalaMutation<string | undefined, unknown>(
    eventId,
    (teamId) => confirmGalaSeats(eventId, teamId),
    "Đã chốt ghế",
    onDone,
  )
export const useDeleteGalaAssignment = (eventId: string, onDone?: () => void) =>
  useGalaMutation<{ assignmentId: string; reason: string }, void>(
    eventId,
    ({ assignmentId, reason }) => deleteGalaAssignment(eventId, assignmentId, reason),
    "Đã gỡ ghế",
    onDone,
  )

export function useSetTeamLeader(eventId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, registrationId }: { teamId: string; registrationId: string | null }) =>
      setTeamLeader(eventId, teamId, registrationId),
    onSuccess: async (result) => {
      toast.success(result.leader ? `Trưởng Team: ${result.leader.name}` : "Đã bỏ trưởng Team")
      await client.invalidateQueries({ queryKey: registrationKeys.all() })
    },
    onError: async (error) =>
      toast.error("Không đổi được trưởng Team", { description: await errorMessage(error) }),
  })
}
