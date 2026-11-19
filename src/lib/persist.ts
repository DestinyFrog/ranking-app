import { snapshot } from './store.svelte'
import type { ITemplate } from './templates'

// Salvamento local: um JSON por template, em localStorage.
export const saveKey = (templateId: string) => `tier:save:${templateId}`

export function loadSave(templateId: string): ISnapshotLike | null {
    try {
        const raw = localStorage.getItem(saveKey(templateId))
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

/** Grava o estado atual agora (sem debounce). */
export function saveNow(templateId: string, title: string) {
    try {
        localStorage.setItem(saveKey(templateId), JSON.stringify(snapshot(templateId, title)))
    } catch { /* cota cheia / bloqueado */ }
}

// import tipo-only evita ciclo com o store
type ISnapshotLike = import('./store.svelte').ISnapshot

// ---- bibliotecas criadas pelo usuário ----
// Índice (id + título) em tier:libraries; os tópicos ficam no salvamento de cada uma.
const INDEX_KEY = 'tier:libraries'
type Meta = { id: string; name: string }

function readIndex(): Meta[] {
    try {
        const v = JSON.parse(localStorage.getItem(INDEX_KEY) ?? '[]')
        return Array.isArray(v) ? v : []
    } catch {
        return []
    }
}

/** Bibliotecas do usuário, com os tópicos vindos do salvamento. */
export function listCustom(): ITemplate[] {
    return readIndex().map((m) => ({
        id: m.id,
        name: m.name,
        description: 'Biblioteca sua',
        topics: loadSave(m.id)?.topics ?? [],
        custom: true,
    }))
}

export function createCustom(name: string): ITemplate {
    const meta: Meta = { id: `custom-${Date.now().toString(36)}`, name: name.trim() }
    try {
        localStorage.setItem(INDEX_KEY, JSON.stringify([...readIndex(), meta]))
    } catch { /* bloqueado: a biblioteca existe só nesta sessão */ }
    return { id: meta.id, name: meta.name, description: 'Biblioteca sua', topics: [], custom: true }
}

export function deleteCustom(id: string) {
    try {
        localStorage.setItem(INDEX_KEY, JSON.stringify(readIndex().filter((m) => m.id !== id)))
        localStorage.removeItem(saveKey(id))
    } catch { /* ignora */ }
}
