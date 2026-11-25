import type { ISnapshot } from './store.svelte'

// Dois formatos de arquivo:
//  - ranking:   snapshot completo (tópicos, módulos, posições) — *.tier.json
//  - biblioteca: só os tópicos, { version: 1, kind: 'library', title, topics } — *.library.json
export interface ILibraryFile { version: 1; kind: 'library'; title: string; topics: ITopic[] }
export type Parsed =
    | { kind: 'ranking'; data: ISnapshot }
    | { kind: 'library'; title: string; topics: ITopic[] }

export function download(name: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
}

const slug = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ranking'

export function exportLibrary(title: string, topics: ITopic[]) {
    const clean = topics.map(({ name, img, zoom, ox, oy }) => ({ name, img, ...(zoom !== undefined && { zoom }), ...(ox !== undefined && { ox }), ...(oy !== undefined && { oy }) }))
    download(`${slug(title)}.library.json`, { version: 1, kind: 'library', title, topics: clean } satisfies ILibraryFile)
}

export const exportRanking = (title: string, snap: ISnapshot) => download(`${slug(title)}.tier.json`, snap)

export function parseFile(text: string): Parsed {
    let d: any
    try { d = JSON.parse(text) } catch { throw new Error('Arquivo não é um JSON válido') }
    if (d?.kind === 'library') {
        if (!Array.isArray(d.topics) || !d.topics.every((t: any) => t && typeof t.name === 'string' && typeof t.img === 'string'))
            throw new Error('Biblioteca inválida')
        return { kind: 'library', title: String(d.title ?? 'Biblioteca importada'), topics: d.topics }
    }
    if (d?.version === 1 && Array.isArray(d.topics) && Array.isArray(d.modules) && d.modules.length)
        return { kind: 'ranking', data: d }
    throw new Error('Arquivo não reconhecido (esperado ranking ou biblioteca)')
}
