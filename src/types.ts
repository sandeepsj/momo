// The Pet model — the single source of truth shared by the app AND the MCP
// connector. One Pet object is stored as one JSON file in the user's Drive
// (see services/drive.ts). Binary assets (photos, prescription scans) live in a
// sibling `<petId>-media` folder and are referenced here by Drive file id.
//
// Keep this generic across species. `momo` is just the first pet.

export interface GoogleUser {
  email: string
  name: string
  picture: string
}

export interface AuthState {
  isLoggedIn: boolean
  user: GoogleUser
  accessToken: string
}

export type Species = 'cat' | 'dog' | 'rabbit' | 'bird' | 'other'

export type EventType =
  | 'milestone'
  | 'vet'
  | 'grooming'
  | 'adventure'
  | 'funny'
  | 'firsts'
  | 'other'

export type ReminderKind =
  | 'vaccination'
  | 'deworming'
  | 'tick-flea'
  | 'grooming'
  | 'vet-checkup'
  | 'custom'

/** A handling trick — situational tips, e.g. "show dry-food cover to get him down". */
export interface Trick {
  id: string
  situation: string // "Get momo down from the wardrobe"
  method: string // "Shake the dry-food cover near the floor"
}

export interface DoctorInfo {
  name: string
  clinic: string
  phone: string
  address: string
  notes: string
}

/** A vet / clinic contact. The first entry in `Pet.vets` is the primary vet. */
export interface VetInfo {
  id: string
  name: string // "Dr. Asha Menon"
  clinic: string // "Whiskers & Co. Clinic"
  phone: string
  address: string // address or free note ("MG Road — after hours")
}

export interface FoodProfile {
  brands: string[]
  likes: string[]
  dislikes: string[]
  allergies: string[]
  diet: string // free-form diet notes / schedule
  schedule: { time: string; food: string }[]
}

export interface PetEvent {
  id: string
  date: string // ISO
  type: EventType
  title: string
  notes: string
  photoFileId?: string
}

export interface WeightEntry {
  date: string // ISO
  kg: number
}

/** A dated medical record with an optional next-due date (vaccines, deworming, tick). */
export interface MedicalRecord {
  id: string
  date: string // ISO — when administered
  name: string // vaccine / product name
  nextDue?: string // ISO — when the next dose is due
  vet: string
  notes: string
}

export interface Prescription {
  id: string
  date: string // ISO
  title: string
  doctor: string
  imageFileId?: string // scan in the media folder
  transcript: string // LLM transcript of the scan
  notes: string
}

export interface MedicalHistory {
  conditions: string[]
  allergies: string[]
  bloodGroup: string
  weightLog: WeightEntry[]
  vaccinations: MedicalRecord[]
  deworming: MedicalRecord[]
  tickFlea: MedicalRecord[]
  prescriptions: Prescription[]
}

export interface Reminder {
  id: string
  kind: ReminderKind
  title: string
  dueDate: string // ISO
  recurrenceDays?: number // e.g. 90 → auto next due when marked done
  done: boolean
  notes: string
}

export interface GalleryPhoto {
  id: string
  fileId: string // image in the media folder
  caption: string
  date: string // ISO
}

/** Per-skill progress against a syllabus template (see data/syllabi.ts). */
export interface TrainingProgress {
  templateId: string
  startedAt: string
  // skillId -> completion record
  completed: Record<string, { doneAt: string; notes: string }>
}

export interface Pet {
  id: string
  version: number
  updatedAt: string

  // identity
  name: string
  species: Species
  breed: string
  gender: 'male' | 'female' | 'unknown'
  emoji: string
  accent: string // hex theme colour
  birthday: string // ISO (or empty)
  adoptionDate: string // ISO (or empty)
  avatarFileId?: string

  // story & care
  story: string // how the parent got the pet (markdown-ish)
  vets: VetInfo[] // first entry is the primary vet
  doctor?: DoctorInfo // legacy single-vet field; kept for back-compat / MCP
  food: FoodProfile
  tricks: Trick[]

  // logs
  events: PetEvent[]
  medical: MedicalHistory
  reminders: Reminder[]
  gallery: GalleryPhoto[]
  training: TrainingProgress
}

/** Lightweight row used by the pet picker, read from appProperties (no full download). */
export interface PetSummary {
  fileId: string
  id: string
  name: string
  species: Species
  emoji: string
  accent: string
  updatedAt: string
}
