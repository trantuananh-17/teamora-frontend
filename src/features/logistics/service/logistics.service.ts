import { z } from "zod"
import { api, apiUrl } from "@/lib/ky"

export const transportLegs = [
  "origin_to_airport",
  "airport_to_hotel",
  "hotel_to_airport",
  "airport_to_origin",
] as const
export type TransportLeg = (typeof transportLegs)[number]
export const vehicleSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  code: z.string(),
  name: z.string(),
  capacity: z.number(),
  leg: z.enum(transportLegs),
  gatherAt: z.coerce.date(),
  departAt: z.coerce.date(),
  pickupPointId: z.string().nullable(),
  destination: z.string(),
  leaderName: z.string().nullable(),
  leaderPhone: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  assignedCount: z.number(),
})
export type Vehicle = z.infer<typeof vehicleSchema>
export type VehicleInput = Omit<
  Vehicle,
  "id" | "eventId" | "createdAt" | "updatedAt" | "assignedCount" | "gatherAt" | "departAt"
> & { gatherAt: string; departAt: string }
const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), total: z.number(), limit: z.number(), offset: z.number() })
export async function listVehicles(eventId: string) {
  const response = await api.get(`events/${eventId}/vehicles`, {
    searchParams: { limit: 100, offset: 0 },
  })
  return pageSchema(vehicleSchema).parse(await response.json())
}
export async function createVehicle(eventId: string, input: VehicleInput) {
  return vehicleSchema.parse(
    await (await api.post(`events/${eventId}/vehicles`, { json: input })).json(),
  )
}
export async function updateVehicle(eventId: string, id: string, input: VehicleInput) {
  return vehicleSchema.parse(
    await (await api.patch(`events/${eventId}/vehicles/${id}`, { json: input })).json(),
  )
}
export async function deleteVehicle(eventId: string, id: string) {
  await api.delete(`events/${eventId}/vehicles/${id}`)
}

const statsSchema = z.object({
  assigned: z.number(),
  unassigned: z.number(),
  remainingSlots: z.number(),
  teamsSplit: z.number(),
  shiftUnmet: z.number(),
})
const vehicleRunSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  type: z.literal("vehicle"),
  status: z.enum(["preview", "committed", "discarded"]),
  params: z.record(z.string(), z.number()),
  stats: statsSchema,
  plan: z.object({
    assignments: z.array(
      z.object({
        registrationId: z.string(),
        vehicleId: z.string(),
        leg: z.enum(transportLegs),
        flags: z.array(z.string()),
      }),
    ),
    unassigned: z.array(
      z.object({
        registrationId: z.string(),
        leg: z.enum(transportLegs),
        reason: z.enum(["missing_flight", "unassigned"]),
      }),
    ),
  }),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  committedAt: z.coerce.date().nullable(),
})
export type VehicleRun = z.infer<typeof vehicleRunSchema>
export async function listVehicleRuns(eventId: string) {
  return z
    .object({ items: z.array(vehicleRunSchema) })
    .parse(
      await (
        await api.get(`events/${eventId}/allocations`, { searchParams: { type: "vehicle" } })
      ).json(),
    ).items
}
export async function previewVehicles(eventId: string) {
  return vehicleRunSchema.parse(
    await (await api.post(`events/${eventId}/allocations`, { json: { type: "vehicle" } })).json(),
  )
}
export async function commitVehicleRun(eventId: string, id: string) {
  return vehicleRunSchema.parse(
    await (await api.post(`events/${eventId}/allocations/${id}/commit`)).json(),
  )
}
export async function discardVehicleRun(eventId: string, id: string) {
  return vehicleRunSchema.parse(
    await (await api.post(`events/${eventId}/allocations/${id}/discard`)).json(),
  )
}
const vehicleAssignmentSchema = z.object({
  registrationId: z.string(),
  leg: z.enum(transportLegs),
  user: z.object({ name: z.string(), email: z.string() }),
  team: z.object({ id: z.string(), name: z.string() }),
  pickupPointId: z.string().nullable(),
  flightId: z.string().nullable(),
  assignment: z
    .object({
      id: z.string(),
      vehicleId: z.string(),
      source: z.enum(["auto", "manual"]),
      locked: z.boolean(),
      flags: z.array(z.string()),
      vehicle: vehicleSchema.omit({ assignedCount: true }),
    })
    .nullable(),
})
export type VehicleAssignmentView = z.infer<typeof vehicleAssignmentSchema>
export async function listVehicleAssignments(eventId: string, page = 1, pageSize = 25) {
  return pageSchema(vehicleAssignmentSchema).parse(
    await (
      await api.get(`events/${eventId}/vehicles/assignments`, {
        searchParams: { limit: pageSize, offset: (page - 1) * pageSize },
      })
    ).json(),
  )
}
export async function manualAssignVehicle(
  eventId: string,
  registrationId: string,
  vehicleId: string,
) {
  await api.post(`events/${eventId}/vehicles/assignments/manual`, {
    json: {
      registrationIds: [registrationId],
      vehicleId,
      reason: "Điều chỉnh thủ công trên bàn phân xe",
    },
  })
}
export async function setVehicleAssignmentLock(
  eventId: string,
  assignmentId: string,
  locked: boolean,
) {
  await api.patch(`events/${eventId}/vehicles/assignments/${assignmentId}/lock`, {
    json: { locked, reason: "Giữ nguyên khi chạy lại phân xe" },
  })
}
export const vehiclesExportUrl = (eventId: string) => apiUrl(`events/${eventId}/vehicles/export`)

const hotelSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  address: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
const hotelItemSchema = z.object({ hotel: hotelSchema, roomCount: z.number() })
const roomTypeSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  hotelId: z.string(),
  name: z.string(),
  capacity: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
const roomSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  hotelId: z.string(),
  roomTypeId: z.string(),
  code: z.string(),
  capacity: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
const roomItemSchema = z.object({
  room: roomSchema,
  hotel: hotelSchema,
  roomType: roomTypeSchema,
  assignedCount: z.number(),
})
export type HotelItem = z.infer<typeof hotelItemSchema>
export type RoomType = z.infer<typeof roomTypeSchema>
export type RoomItem = z.infer<typeof roomItemSchema>
export async function listHotels(eventId: string) {
  return z
    .object({ items: z.array(hotelItemSchema) })
    .parse(await (await api.get(`events/${eventId}/hotels`)).json()).items
}
export async function listRoomTypes(eventId: string) {
  return z
    .object({ items: z.array(roomTypeSchema) })
    .parse(await (await api.get(`events/${eventId}/room-types`)).json()).items
}
export async function listRooms(eventId: string) {
  return z
    .object({ items: z.array(roomItemSchema) })
    .parse(await (await api.get(`events/${eventId}/rooms`)).json()).items
}
const roomAssignmentViewSchema = z.object({
  assignment: z.object({
    id: z.string(),
    roomId: z.string(),
    registrationId: z.string(),
    source: z.enum(["import", "manual", "auto"]),
    locked: z.boolean(),
  }),
  room: roomSchema,
  hotel: hotelSchema,
  employeeCode: z.string().nullable(),
  name: z.string(),
  email: z.string(),
})
export type RoomAssignmentView = z.infer<typeof roomAssignmentViewSchema>
export async function listRoomAssignments(eventId: string) {
  return z
    .object({ items: z.array(roomAssignmentViewSchema) })
    .parse(await (await api.get(`events/${eventId}/room-assignments`)).json()).items
}
export async function createHotel(eventId: string, input: { name: string; address: string }) {
  await api.post(`events/${eventId}/hotels`, { json: input })
}
export async function updateHotel(
  eventId: string,
  id: string,
  input: { name: string; address: string },
) {
  await api.patch(`events/${eventId}/hotels/${id}`, { json: input })
}
export async function deleteHotel(eventId: string, id: string) {
  await api.delete(`events/${eventId}/hotels/${id}`)
}
export async function createRoomType(
  eventId: string,
  hotelId: string,
  input: { name: string; capacity: number },
) {
  await api.post(`events/${eventId}/hotels/${hotelId}/room-types`, { json: input })
}
export async function updateRoomType(
  eventId: string,
  id: string,
  input: { name: string; capacity: number },
) {
  await api.patch(`events/${eventId}/room-types/${id}`, { json: input })
}
export async function deleteRoomType(eventId: string, id: string) {
  await api.delete(`events/${eventId}/room-types/${id}`)
}
export async function createRoom(
  eventId: string,
  hotelId: string,
  input: { roomTypeId: string; code: string; capacity: number },
) {
  await api.post(`events/${eventId}/hotels/${hotelId}/rooms`, { json: input })
}
export async function updateRoom(
  eventId: string,
  id: string,
  input: { roomTypeId: string; code: string; capacity: number },
) {
  await api.patch(`events/${eventId}/rooms/${id}`, { json: input })
}
export async function deleteRoom(eventId: string, id: string) {
  await api.delete(`events/${eventId}/rooms/${id}`)
}
export async function importRoomAssignments(eventId: string, file: File) {
  const body = new FormData()
  body.set("file", file)
  return z
    .object({ fileName: z.string(), total: z.number() })
    .parse(await (await api.post(`events/${eventId}/room-assignments/import`, { body })).json())
}
export const roomAssignmentsExportUrl = (eventId: string) =>
  apiUrl(`events/${eventId}/room-assignments/export`)
export const accommodationsExportUrl = (eventId: string) =>
  apiUrl(`events/${eventId}/accommodations/export`)
