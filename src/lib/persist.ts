import { snapshot } from './store.svelte'
import { templates, type ITemplate } from './templates'

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
export function saveNow(id: string, title: string) {
    saveRaw(id, title, JSON.stringify(snapshot(id, title)))
}

/** Grava um snapshot já serializado e garante que o ranking apareça na lista inicial. */
export function saveRaw(id: string, title: string, data: string) {
    try {
        localStorage.setItem(saveKey(id), data)
        const idx = readIndex()
        const i = idx.findIndex((m) => m.id === id)
        if (i < 0) localStorage.setItem(INDEX_KEY, JSON.stringify([...idx, { id, name: title }]))
        else if (idx[i].name !== title) {
            idx[i].name = title
            localStorage.setItem(INDEX_KEY, JSON.stringify(idx))
        }
    } catch { /* cota cheia / bloqueado */ }
}

// import tipo-only evita ciclo com o store
type ISnapshotLike = import('./store.svelte').ISnapshot

// ---- rankings do usuário ----
// Um ranking é uma cópia de um template (ou criado do zero): tem os próprios tópicos, módulos e
// disposições, e nada propaga de volta ao template de origem. Aparecem na lista inicial junto
// com os templates nativos. Índice (id + título) em tier:items; o conteúdo fica em tier:save:<id>.
const INDEX_KEY = 'tier:items'
type Meta = { id: string; name: string }

/** Formato antigo: bibliotecas em tier:libraries e um salvamento por template nativo. */
function migrate() {
    try {
        if (localStorage.getItem(INDEX_KEY) !== null) return
        const items: Meta[] = JSON.parse(localStorage.getItem('tier:libraries') ?? '[]')
        for (const t of templates) {
            const raw = localStorage.getItem(saveKey(t.id))
            if (!raw) continue
            const id = `r-${t.id}`
            localStorage.setItem(saveKey(id), raw)
            localStorage.removeItem(saveKey(t.id))
            items.push({ id, name: t.name })
        }
        localStorage.setItem(INDEX_KEY, JSON.stringify(items))
        localStorage.removeItem('tier:libraries')
    } catch { /* ignora */ }
}
migrate()

function readIndex(): Meta[] {
    try {
        const v = JSON.parse(localStorage.getItem(INDEX_KEY) ?? '[]')
        return Array.isArray(v) ? v : []
    } catch {
        return []
    }
}

/** Rankings do usuário, com os tópicos vindos do salvamento. */
export function listCustom(): ITemplate[] {
    return readIndex().map((m) => ({
        id: m.id,
        name: m.name,
        description: 'Seu ranking',
        topics: loadSave(m.id)?.topics ?? [],
        custom: true,
    }))
}

export const newId = () => `r-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function createCustom(name: string): ITemplate {
    const meta: Meta = { id: newId(), name: name.trim() }
    try {
        localStorage.setItem(INDEX_KEY, JSON.stringify([...readIndex(), meta]))
    } catch { /* bloqueado: a biblioteca existe só nesta sessão */ }
    return { id: meta.id, name: meta.name, description: 'Seu ranking', topics: [], custom: true }
}

export function renameCustom(id: string, name: string) {
    name = name.trim()
    if (!name) return
    try {
        localStorage.setItem(INDEX_KEY, JSON.stringify(readIndex().map((m) => (m.id === id ? { ...m, name } : m))))
        const save = loadSave(id)
        if (save) localStorage.setItem(saveKey(id), JSON.stringify({ ...save, title: name }))
    } catch { /* ignora */ }
}

export function deleteCustom(id: string) {
    try {
        localStorage.setItem(INDEX_KEY, JSON.stringify(readIndex().filter((m) => m.id !== id)))
        localStorage.removeItem(saveKey(id))
    } catch { /* ignora */ }
}
