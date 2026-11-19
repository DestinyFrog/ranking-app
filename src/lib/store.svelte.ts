// Estado compartilhado entre a barra de tópicos e os módulos.
// Cada módulo tem a sua própria disposição dos tópicos (layouts). Em cada um, o tópico está em:
//  - na barra (sem pos nem place)
//  - flutuando sobre a tela (pos)
//  - dentro de uma linha de tier (place)
let rowSeq = 0
export const newRowId = () => ++rowSeq

export const board = $state<{ topics: ITopic[]; z: number; active: number; display: TopicDisplay }>({
    z: 0,
    active: 1, // módulo visível
    display: 'both',
    topics: [],
})

/** Carrega os tópicos de um template e zera as disposições de todos os módulos. */
export function loadTopics(topics: ITopic[]) {
    board.topics = topics.map((t, i) => ({ ...t, id: i + 1 }))
    for (const k in layouts) delete layouts[k]
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
