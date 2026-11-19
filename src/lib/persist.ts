import { snapshot } from './store.svelte'
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
