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

export const board = $state<{
    topics: ITopic[]
    z: number
    active: number
    display: TopicDisplay
    modules: IModule[]
}>({
    z: 0,
    active: 1, // módulo visível
    display: 'both',
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
    active: number
    z: number
    topics: ITopic[]
    modules: IModule[]
    rows: Record<number, ITierRow[]>
    layouts: Record<number, Record<number, IPlacement>>
}

export function snapshot(template: string, title: string): ISnapshot {
    return $state.snapshot({
        version: 1 as const,
        template,
        title,
        savedAt: new Date().toISOString(),
        display: board.display,
        active: board.active,
        z: board.z,
        topics: board.topics,
        modules: board.modules,
        rows: tierRows,
        layouts,
    })
}

/** Valida o mínimo e remonta o estado. Lança erro se o arquivo não servir. */
export function restore(d: ISnapshot) {
    if (d?.version !== 1 || !Array.isArray(d.topics) || !Array.isArray(d.modules) || !d.modules.length)
        throw new Error('Arquivo de ranking inválido')
    board.topics = d.topics
    board.modules = d.modules
    board.display = d.display ?? 'both'
    board.z = d.z ?? 0
    board.active = d.modules.some((m) => m.id === d.active) ? d.active : d.modules[0].id
    for (const k in tierRows) delete tierRows[k]
    for (const k in layouts) delete layouts[k]
    Object.assign(tierRows, d.rows ?? {})
    Object.assign(layouts, d.layouts ?? {})
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
}

/** Tira da linha todos os tópicos dela (voltam para a barra). */
export function releaseRow(moduleId: number, rowId: number) {
    const m = layouts[moduleId]
    if (!m) return
    for (const id in m) if (m[id].place?.row === rowId) m[id] = {}
}

const placeholder = (name: string) =>
    'data:image/svg+xml;utf8,' +
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
