// Pet orchestration over the Drive service: list, open, create, persist, delete.
// Components talk to this, not to drive.ts directly. normalize() backfills any
// missing keys so older / partial files keep loading.

import type { Pet, PetSummary, Species } from '@/types'
import { newPet } from '@/data/petKinds'
import {
  AuthExpiredError,
  createPetFile,
  deletePetFile,
  listPets as driveList,
  loadPetFile,
  updatePetFile,
} from '@/services/drive'

export { AuthExpiredError }

export function normalize(p: Partial<Pet>): Pet {
  const now = p.updatedAt ?? new Date().toISOString()
  const species: Species = p.species ?? 'other'
  return {
    id: p.id ?? crypto.randomUUID(),
    version: p.version ?? 1,
    updatedAt: now,
    name: p.name ?? 'Unnamed pet',
    species,
    breed: p.breed ?? '',
    gender: p.gender ?? 'unknown',
    emoji: p.emoji ?? '🐾',
    accent: p.accent ?? '#f7a072',
    birthday: p.birthday ?? '',
    adoptionDate: p.adoptionDate ?? '',
    avatarFileId: p.avatarFileId,
    story: p.story ?? '',
    doctor: { name: '', clinic: '', phone: '', address: '', notes: '', ...(p.doctor ?? {}) },
    food: {
      brands: [],
      likes: [],
      dislikes: [],
      allergies: [],
      diet: '',
      schedule: [],
      ...(p.food ?? {}),
    },
    tricks: p.tricks ?? [],
    events: p.events ?? [],
    medical: {
      conditions: [],
      allergies: [],
      bloodGroup: '',
      weightLog: [],
      vaccinations: [],
      deworming: [],
      tickFlea: [],
      prescriptions: [],
      ...(p.medical ?? {}),
    },
    reminders: p.reminders ?? [],
    gallery: p.gallery ?? [],
    training: p.training ?? { templateId: '', startedAt: now, completed: {} },
  }
}

export function listPets(token: string): Promise<PetSummary[]> {
  return driveList(token)
}

export async function openPet(fileId: string, token: string): Promise<{ fileId: string; pet: Pet }> {
  const raw = await loadPetFile(fileId, token)
  return { fileId, pet: normalize(raw) }
}

export async function createPet(
  name: string,
  species: Species,
  token: string,
): Promise<{ fileId: string; pet: Pet }> {
  const pet = newPet(name, species, new Date().toISOString())
  const fileId = await createPetFile(pet, token)
  return { fileId, pet }
}

/** Persist a pet, stamping updatedAt. Returns the stamped pet. */
export async function persist(fileId: string, pet: Pet, token: string): Promise<Pet> {
  const stamped = { ...pet, updatedAt: new Date().toISOString() }
  await updatePetFile(fileId, stamped, token)
  return stamped
}

export function removePet(fileId: string, token: string): Promise<void> {
  return deletePetFile(fileId, token)
}
