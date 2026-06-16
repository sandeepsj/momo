// Species presets: emoji, accent, the default care reminders a new pet of that
// kind should start with, and a factory that seeds a blank Pet.

import type { Pet, ReminderKind, Species } from '@/types'
import { defaultSyllabusFor } from '@/data/syllabi'

export interface SpeciesPreset {
  species: Species
  label: string
  emoji: string
  accent: string
  // Care cadence used to auto-create the first reminders.
  defaultReminders: { kind: ReminderKind; title: string; everyDays: number }[]
}

export const SPECIES_PRESETS: SpeciesPreset[] = [
  {
    species: 'cat',
    label: 'Cat',
    emoji: '🐱',
    accent: '#f7a072',
    defaultReminders: [
      { kind: 'deworming', title: 'Deworming dose', everyDays: 90 },
      { kind: 'tick-flea', title: 'Tick & flea spot-on', everyDays: 30 },
      { kind: 'vaccination', title: 'Annual booster vaccine', everyDays: 365 },
      { kind: 'vet-checkup', title: 'Routine vet check-up', everyDays: 180 },
    ],
  },
  {
    species: 'dog',
    label: 'Dog',
    emoji: '🐶',
    accent: '#8ec5fc',
    defaultReminders: [
      { kind: 'deworming', title: 'Deworming dose', everyDays: 90 },
      { kind: 'tick-flea', title: 'Tick & flea treatment', everyDays: 30 },
      { kind: 'vaccination', title: 'Annual booster vaccine', everyDays: 365 },
      { kind: 'grooming', title: 'Grooming session', everyDays: 45 },
    ],
  },
  {
    species: 'rabbit',
    label: 'Rabbit',
    emoji: '🐰',
    accent: '#9FD9B8',
    defaultReminders: [
      { kind: 'vaccination', title: 'RHDV / Myxomatosis vaccine', everyDays: 365 },
      { kind: 'vet-checkup', title: 'Nail & teeth check', everyDays: 60 },
    ],
  },
  {
    species: 'bird',
    label: 'Bird',
    emoji: '🐦',
    accent: '#F6C667',
    defaultReminders: [
      { kind: 'vet-checkup', title: 'Avian vet check-up', everyDays: 180 },
    ],
  },
  {
    species: 'other',
    label: 'Other',
    emoji: '🐾',
    accent: '#C3B1E1',
    defaultReminders: [
      { kind: 'vet-checkup', title: 'Vet check-up', everyDays: 365 },
    ],
  },
]

export function presetFor(species: Species): SpeciesPreset {
  return SPECIES_PRESETS.find((p) => p.species === species) ?? SPECIES_PRESETS[4]
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/** Seed a brand-new pet with species defaults, starter reminders and a syllabus. */
export function newPet(name: string, species: Species, nowIso: string): Pet {
  const preset = presetFor(species)
  const syllabus = defaultSyllabusFor(species)
  return {
    id: crypto.randomUUID(),
    version: 1,
    updatedAt: nowIso,
    name: name.trim() || preset.label,
    species,
    breed: '',
    gender: 'unknown',
    emoji: preset.emoji,
    accent: preset.accent,
    birthday: '',
    adoptionDate: '',
    story: '',
    vets: [],
    food: { brands: [], likes: [], dislikes: [], allergies: [], diet: '', schedule: [] },
    tricks: [],
    events: [],
    medical: {
      conditions: [],
      allergies: [],
      bloodGroup: '',
      weightLog: [],
      vaccinations: [],
      deworming: [],
      tickFlea: [],
      prescriptions: [],
    },
    reminders: preset.defaultReminders.map((r) => ({
      id: crypto.randomUUID(),
      kind: r.kind,
      title: r.title,
      dueDate: addDays(nowIso, r.everyDays),
      recurrenceDays: r.everyDays,
      done: false,
      notes: 'Auto-created from species care schedule.',
    })),
    gallery: [],
    training: { templateId: syllabus.id, startedAt: nowIso, completed: {} },
  }
}
