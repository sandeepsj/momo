// Google Drive as the data store.
//
// Layout (drive.file scope):
//   PetDashboard/                 (app folder)
//     <petId>.json                (one Pet object each — the structured record)
//     <petId>-media/              (folder of binary assets for that pet)
//       <uuid>.jpg                (gallery photos, prescription scans, avatar)
//
// Pet JSON files carry appProperties so the picker can list without downloading
// every file (the `pd=pet` marker scopes the query to our files).

import type { Pet, PetSummary, Species } from '@/types'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const APP_FOLDER = 'PetDashboard'
const BOUNDARY = '---momo-boundary'

/** Thrown on a 401 so the auth layer can clear the session and re-prompt. */
export class AuthExpiredError extends Error {
  constructor() {
    super('Google access token expired')
    this.name = 'AuthExpiredError'
  }
}

async function driveFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  })
  if (res.status === 401) throw new AuthExpiredError()
  if (!res.ok) throw new Error(`Drive ${init?.method ?? 'GET'} ${res.status}: ${await res.text()}`)
  return res
}

// ---- folders -------------------------------------------------------------

async function findFolder(name: string, token: string, parent?: string): Promise<string | null> {
  const clauses = [
    `name='${name.replace(/'/g, "\\'")}'`,
    `mimeType='application/vnd.google-apps.folder'`,
    'trashed=false',
  ]
  if (parent) clauses.push(`'${parent}' in parents`)
  const q = encodeURIComponent(clauses.join(' and '))
  const res = await driveFetch(`${DRIVE_API}/files?q=${q}&fields=files(id)&spaces=drive`, token)
  const data = (await res.json()) as { files: { id: string }[] }
  return data.files[0]?.id ?? null
}

async function createFolder(name: string, token: string, parent?: string): Promise<string> {
  const res = await driveFetch(`${DRIVE_API}/files?fields=id`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parent ? { parents: [parent] } : {}),
    }),
  })
  return ((await res.json()) as { id: string }).id
}

async function getAppFolder(token: string): Promise<string> {
  return (await findFolder(APP_FOLDER, token)) ?? (await createFolder(APP_FOLDER, token))
}

/** Find-or-create the media folder for a pet; returns its folder id. */
export async function getMediaFolder(petId: string, token: string): Promise<string> {
  const app = await getAppFolder(token)
  const name = `${petId}-media`
  return (await findFolder(name, token, app)) ?? (await createFolder(name, token, app))
}

// ---- pet records ---------------------------------------------------------

// appProperties values must be strings ≤124 bytes. Truncate defensively.
function appPropsFor(pet: Pet): Record<string, string> {
  return {
    pd: 'pet',
    pid: pet.id,
    name: pet.name.slice(0, 100),
    species: pet.species,
    emoji: pet.emoji,
    accent: pet.accent,
    updatedAt: pet.updatedAt,
  }
}

interface DriveFile {
  id: string
  modifiedTime: string
  appProperties?: Record<string, string>
}

/** List all pets (newest first), reading metadata only — no full downloads. */
export async function listPets(token: string): Promise<PetSummary[]> {
  const folder = await findFolder(APP_FOLDER, token)
  if (!folder) return []
  const q = encodeURIComponent(
    `'${folder}' in parents and trashed=false and appProperties has { key='pd' and value='pet' }`,
  )
  const res = await driveFetch(
    `${DRIVE_API}/files?q=${q}&fields=files(id,modifiedTime,appProperties)&spaces=drive&pageSize=200`,
    token,
  )
  const data = (await res.json()) as { files: DriveFile[] }
  return data.files
    .map((f): PetSummary => {
      const p = f.appProperties ?? {}
      return {
        fileId: f.id,
        id: p.pid ?? f.id,
        name: p.name ?? 'Unnamed pet',
        species: (p.species as Species) ?? 'other',
        emoji: p.emoji ?? '🐾',
        accent: p.accent ?? '#f7a072',
        updatedAt: p.updatedAt ?? f.modifiedTime,
      }
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function loadPetFile(fileId: string, token: string): Promise<Pet> {
  const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`, token)
  return (await res.json()) as Pet
}

function multipartJson(metadata: object, json: string): string {
  return (
    `--${BOUNDARY}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${BOUNDARY}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${json}\r\n` +
    `--${BOUNDARY}--`
  )
}

export async function createPetFile(pet: Pet, token: string): Promise<string> {
  const folder = await getAppFolder(token)
  const metadata = {
    name: `${pet.id}.json`,
    parents: [folder],
    mimeType: 'application/json',
    appProperties: appPropsFor(pet),
  }
  const res = await driveFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id`, token, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${BOUNDARY}` },
    body: multipartJson(metadata, JSON.stringify(pet, null, 2)),
  })
  return ((await res.json()) as { id: string }).id
}

/** Overwrite a pet file's content AND refresh its appProperties in one call. */
export async function updatePetFile(fileId: string, pet: Pet, token: string): Promise<void> {
  await driveFetch(`${UPLOAD_API}/files/${fileId}?uploadType=multipart`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': `multipart/related; boundary=${BOUNDARY}` },
    body: multipartJson({ appProperties: appPropsFor(pet) }, JSON.stringify(pet, null, 2)),
  })
}

export async function deletePetFile(fileId: string, token: string): Promise<void> {
  await driveFetch(`${DRIVE_API}/files/${fileId}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true }),
  })
}

// ---- media (photos & scans) ---------------------------------------------

/** Upload a binary file into the pet's media folder. Returns the Drive file id. */
export async function uploadMedia(
  petId: string,
  file: Blob,
  filename: string,
  token: string,
): Promise<string> {
  const folder = await getMediaFolder(petId, token)
  const metadata = { name: filename, parents: [folder] }
  const meta = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  const form = new FormData()
  form.append('metadata', meta)
  form.append('file', file)
  const res = await driveFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id`, token, {
    method: 'POST',
    body: form, // browser sets the multipart boundary automatically
  })
  return ((await res.json()) as { id: string }).id
}

/** Download a media file and return an object URL (remember to revoke it). */
export async function mediaObjectUrl(fileId: string, token: string): Promise<string> {
  const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`, token)
  return URL.createObjectURL(await res.blob())
}

/** Download a media file as a base64 data URL (used for LLM vision calls). */
export async function mediaDataUrl(fileId: string, token: string): Promise<string> {
  const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`, token)
  const blob = await res.blob()
  return await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('Failed to read media blob'))
    r.readAsDataURL(blob)
  })
}

export async function deleteMedia(fileId: string, token: string): Promise<void> {
  await driveFetch(`${DRIVE_API}/files/${fileId}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true }),
  })
}
