// Estado compartilhado entre a barra de tópicos e os módulos.
// Cada módulo tem a sua própria disposição dos tópicos (layouts). Em cada um, o tópico está em:
//  - na barra (sem pos nem place)
//  - flutuando sobre a tela (pos)
//  - dentro de uma linha de tier (place)
let rowSeq = 0
export const newRowId = () => ++rowSeq

export interface ITierRow {
    id: number
    label: string
    color: string
}

export const DEFAULT_SIZE = 74 // = --cell-size em app.css

export const board = $state<{
    topics: ITopic[]
    z: number
    active: number
    display: TopicDisplay
    size: number // largura dos tópicos em px (todos juntos)
    modules: IModule[]
}>({
    z: 0,
    active: 1, // módulo visível
    display: 'both',
    size: DEFAULT_SIZE,
    topics: [],
    modules: [],
})

const defaultModules = (): IModule[] => [
    { id: 1, type: 'tier', name: 'Tier' },
    { id: 2, type: 'quadrant', name: '4 setores' },
    { id: 3, type: 'free', name: 'Área livre' },
]

/** Carrega os tópicos de um template e zera módulos e disposições. */
export function loadTopics(topics: ITopic[]) {
    board.topics = topics.map((t, i) => ({ ...t, id: i + 1 }))
    board.modules = defaultModules()
    board.active = 1
    board.z = 0
    for (const k in layouts) delete layouts[k]
    for (const k in tierRows) delete tierRows[k]
    for (const k in shapesByModule) delete shapesByModule[k]
    for (const m of board.modules) if (m.type === 'tier') initRows(m.id)
}

// linhas de cada módulo do tipo tier
const tierRows: Record<number, ITierRow[]> = $state({})

/** Somente leitura (seguro dentro de $derived). As linhas são criadas por initRows. */
export const getRows = (moduleId: number): ITierRow[] => tierRows[moduleId] ?? []

function initRows(moduleId: number) {
    tierRows[moduleId] = [
        { id: newRowId(), label: 'S', color: '#ff7f7f' },
        { id: newRowId(), label: 'A', color: '#ffbf7f' },
        { id: newRowId(), label: 'B', color: '#ffdf7f' },
        { id: newRowId(), label: 'C', color: '#ffff7f' },
        { id: newRowId(), label: 'D', color: '#bfff7f' },
    ]
}

/** Arquivo salvo: tudo que é preciso para remontar o ranking. */
export interface ISnapshot {
    version: 1
    template: string
    title: string
    savedAt: string
    display: TopicDisplay
    size?: number
    active: number
    z: number
    topics: ITopic[]
    modules: IModule[]
    rows: Record<number, ITierRow[]>
    layouts: Record<number, Record<number, IPlacement>>
    shapes?: Record<number, Shape[]>
}

// formas do módulo livre (linhas, círculos, textos), por módulo
export interface Line { id: number; kind: 'line'; x1: number; y1: number; x2: number; y2: number; color: string }
export interface Circle { id: number; kind: 'circle'; cx: number; cy: number; r: number; color: string }
export interface Text { id: number; kind: 'text'; x: number; y: number; text: string; size: number; color: string }
export type Shape = Line | Circle | Text

const shapesByModule: Record<number, Shape[]> = $state({})

/** Somente leitura (seguro dentro de $derived). */
export const getShapes = (moduleId: number): Shape[] => shapesByModule[moduleId] ?? []

export function addShape(moduleId: number, s: Shape) {
    ;(shapesByModule[moduleId] ??= []).push(s)
}

export function removeShape(moduleId: number, id: number) {
    const a = shapesByModule[moduleId]
    const i = a?.findIndex((s) => s.id === id) ?? -1
    if (i >= 0) a.splice(i, 1)
}

export function snapshot(template: string, title: string): ISnapshot {
    return $state.snapshot({
        version: 1 as const,
        template,
        title,
        savedAt: new Date().toISOString(),
        display: board.display,
        size: board.size,
        active: board.active,
        z: board.z,
        topics: board.topics,
        modules: board.modules,
        rows: tierRows,
        layouts,
        shapes: shapesByModule,
    })
}

/** Valida o mínimo e remonta o estado. Lança erro se o arquivo não servir. */
export function restore(d: ISnapshot) {
    if (d?.version !== 1 || !Array.isArray(d.topics) || !Array.isArray(d.modules) || !d.modules.length)
        throw new Error('Arquivo de ranking inválido')
    board.topics = d.topics
    board.modules = d.modules
    board.display = d.display ?? 'both'
    board.size = d.size ?? DEFAULT_SIZE
    board.z = d.z ?? 0
    board.active = d.modules.some((m) => m.id === d.active) ? d.active : d.modules[0].id
    for (const k in tierRows) delete tierRows[k]
    for (const k in layouts) delete layouts[k]
    Object.assign(tierRows, d.rows ?? {})
    Object.assign(layouts, d.layouts ?? {})
    for (const k in shapesByModule) delete shapesByModule[k]
    Object.assign(shapesByModule, d.shapes ?? {})
    // evita colisão de ids novos com os restaurados
    for (const rs of Object.values(tierRows)) for (const r of rs) rowSeq = Math.max(rowSeq, r.id)
}

export function addModule(type: ModuleType, name: string) {
    const id = board.modules.reduce((m, x) => Math.max(m, x.id), 0) + 1
    board.modules.push({ id, type, name })
    if (type === 'tier') initRows(id)
    board.active = id
}

export function removeModule(id: number) {
    if (board.modules.length === 1) return
    const i = board.modules.findIndex((m) => m.id === id)
    board.modules.splice(i, 1)
    clearModule(id)
    if (board.active === id) board.active = board.modules[Math.max(0, i - 1)].id
}

// layouts[idDoModulo][idDoTopico]
const layouts: Record<number, Record<number, IPlacement>> = $state({})

export const getPlacement = (moduleId: number, topicId?: number): IPlacement | undefined =>
    topicId === undefined ? undefined : layouts[moduleId]?.[topicId]

export function setPlacement(moduleId: number, topicId: number, p: IPlacement) {
    ;(layouts[moduleId] ??= {})[topicId] = p
}

export function clearModule(moduleId: number) {
    delete layouts[moduleId]
    delete tierRows[moduleId]
    delete shapesByModule[moduleId]
}

/** Tira da linha todos os tópicos dela (voltam para a barra). */
export function releaseRow(moduleId: number, rowId: number) {
    const m = layouts[moduleId]
    if (!m) return
    for (const id in m) if (m[id].place?.row === rowId) m[id] = {}
}

const PLACEHOLDER = 'data:image/svg+xml;utf8,'
/** Tópico ainda sem imagem de verdade (usa o placeholder com a inicial). */
export const isPlaceholder = (t: ITopic) => t.img.startsWith(PLACEHOLDER)

/** Tópico selecionado para receber uma imagem colada (Ctrl+V). */
export const ui = $state<{ pasteId: number | null }>({ pasteId: null })

/** Tópico aberto no editor (duplo clique / botão direito). */
export const edit = $state<{ id: number | null }>({ id: null })

export function updateTopic(id: number, patch: { name?: string; img?: string; zoom?: number; ox?: number; oy?: number }) {
    const t = board.topics.find((x) => x.id === id)
    if (!t) return
    if (patch.name !== undefined && patch.name.trim()) {
        const wasPlaceholder = isPlaceholder(t)
        t.name = patch.name.trim()
        if (wasPlaceholder && patch.img === undefined) t.img = placeholder(t.name)
    }
    if (patch.img !== undefined) t.img = patch.img.trim() || placeholder(t.name)
    if (patch.zoom !== undefined) { if (patch.zoom === 1) delete t.zoom; else t.zoom = patch.zoom }
    if (patch.ox !== undefined) { if (patch.ox === 50) delete t.ox; else t.ox = patch.ox }
    if (patch.oy !== undefined) { if (patch.oy === 0) delete t.oy; else t.oy = patch.oy }
}

/** Estilo inline da imagem do tópico (zoom + enquadramento). */
export const imgStyle = (t: { zoom?: number; ox?: number; oy?: number }) => {
    const x = t.ox ?? 50, y = t.oy ?? 0
    return `object-position:${x}% ${y}%;transform-origin:${x}% ${y}%;transform:scale(${t.zoom ?? 1})`
}

/** Remove o tópico do quadro e de todas as disposições. */
export function deleteTopic(id: number) {
    const i = board.topics.findIndex((x) => x.id === id)
    if (i >= 0) board.topics.splice(i, 1)
    for (const m in layouts) delete layouts[m][id]
}

export function setTopicImage(id: number, img: string) {
    const t = board.topics.find((x) => x.id === id)
    if (t) t.img = img
}

// reduz a imagem colada (print de tela é grande e o salvamento local tem cota)
async function shrink(file: Blob, max = 400): Promise<string> {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k)
    c.height = Math.round(bmp.height * k)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', 0.85)
}

/** Imagem (arquivo) ou link http(s) vindo da área de transferência; null se não houver. */
export async function imageFromClipboard(ev: ClipboardEvent): Promise<string | null> {
    const cd = ev.clipboardData
    if (!cd) return null
    const file = [...cd.files].find((f) => f.type.startsWith('image/'))
    if (file) return shrink(file).catch(() => URL.createObjectURL(file))
    const text = cd.getData('text').trim()
    return /^https?:\/\/\S+$/.test(text) ? text : null
}

const placeholder = (name: string) =>
    PLACEHOLDER +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#92517d"/><text x="100" y="100" font-size="100" font-family="sans-serif" fill="whitesmoke" text-anchor="middle" dominant-baseline="central">${
            (name.trim()[0] ?? '?').toUpperCase().replace(/[<>&]/g, '?')
        }</text></svg>`,
    )

/** Adiciona um tópico à barra (sem imagem, usa um placeholder com a inicial). */
export function addTopic(name: string, img: string) {
    const id = board.topics.reduce((m, t) => Math.max(m, t.id ?? 0), 0) + 1
    board.topics.push({ id, name: name.trim(), img: img.trim() || placeholder(name) })
}

// ---- quadro de referência dos tópicos flutuantes ----
// A posição é guardada como fração do quadro do módulo ([data-plane] se existir, senão [data-frame]).
/** Muda sempre que um quadro redimensiona, para as posições em px serem recalculadas. */
export const frames = $state({ n: 0 })

export const frameEl = (moduleId: number) =>
    document.querySelector<HTMLElement>(`[data-plane="${moduleId}"]`) ??
    document.querySelector<HTMLElement>(`[data-frame="${moduleId}"]`)

/** Action: avisa quando o quadro muda de tamanho (inclui sair/entrar de hidden). */
export function frame(node: HTMLElement) {
    const ro = new ResizeObserver(() => frames.n++)
    ro.observe(node)
    return { destroy: () => ro.disconnect() }
}
