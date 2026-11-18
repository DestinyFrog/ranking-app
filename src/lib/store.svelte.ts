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
    topics: [
        {
            img: 'https://cdn.myanimelist.net/r/200x268/images/characters/5/203429.jpg?s=5e33d396ad8cbc5542e82c3270a537f1',
            name: 'Kaito',
        },
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxGRR2btPdibU91kLR9LSMQHHysCqVbMOsQ-QzYeZz6A&s=10',
            name: 'Gon',
        },
        {
            img: 'https://ovicio.com.br/wp-content/uploads/2022/03/20220323-killua-zoldyck-555x555.webp',
            name: 'Killua',
        },
        {
            img: 'https://sm.ign.com/ign_br/screenshot/default/gotham-knights-1_ers7.png',
            name: 'Kurapika',
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/7/73/HxH2011_EP145_Leorio_Portrait.png/revision/latest?cb=20230902193715',
            name: 'Leorio',
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/a/aa/HxH2011_EP3_Hanzo_Portrait.png/revision/latest?cb=20221007164354',
            name: 'Hanzo'
        },
        {
            img : 'https://static.wikia.nocookie.net/hunterxhunter/images/2/29/Hisoka_Morow_YC_Portrait.png/revision/latest?cb=20190123172039',
            name: 'Hisoka'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/4/4c/Machi_Komacine_HA_Portrait.png/revision/latest?cb=20131116122706',
            name: 'Machi Komazine'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/9/9e/HxH2011_EP53_Shizuku_Portrait.png/revision/latest?cb=20230122061315',
            name: 'Shizuku Murasaki'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/d/da/Pakunoda_YC_Portrait.png/revision/latest?cb=20190124184929',
            name: 'Pakunoda'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/7/78/Chrollo_Lucilfer_GI_Portrait.png/revision/latest?cb=20130502190618',
            name: 'Chrollo Lucifer'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/4/46/HxH2011_EP50_Nobunaga_Portrait.png/revision/latest?cb=20230122183803',
            name: 'Nobunaga'
        },
    ],
})
board.topics.forEach((t, i) => (t.id = i + 1))

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
