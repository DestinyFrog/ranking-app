import countries from '../assets/countries.json'

// Templates de ranking (dados fixos por enquanto, nada é salvo).
// Os tópicos vêm sem id; o id é atribuído ao abrir o template.
export const hxhTopics: ITopic[] = [
    { name: 'Kaito', img: 'https://cdn.myanimelist.net/r/200x268/images/characters/5/203429.jpg?s=5e33d396ad8cbc5542e82c3270a537f1' },
    { name: 'Gon', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxGRR2btPdibU91kLR9LSMQHHysCqVbMOsQ-QzYeZz6A&s=10' },
    { name: 'Killua', img: 'https://ovicio.com.br/wp-content/uploads/2022/03/20220323-killua-zoldyck-555x555.webp' },
    { name: 'Kurapika', img: 'https://sm.ign.com/ign_br/screenshot/default/gotham-knights-1_ers7.png' },
    { name: 'Leorio', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/7/73/HxH2011_EP145_Leorio_Portrait.png/revision/latest?cb=20230902193715' },
    { name: 'Hanzo', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/a/aa/HxH2011_EP3_Hanzo_Portrait.png/revision/latest?cb=20221007164354' },
    { name: 'Hisoka', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/2/29/Hisoka_Morow_YC_Portrait.png/revision/latest?cb=20190123172039' },
    { name: 'Machi Komazine', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/4/4c/Machi_Komacine_HA_Portrait.png/revision/latest?cb=20131116122706' },
    { name: 'Shizuku Murasaki', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/9/9e/HxH2011_EP53_Shizuku_Portrait.png/revision/latest?cb=20230122061315' },
    { name: 'Pakunoda', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/d/da/Pakunoda_YC_Portrait.png/revision/latest?cb=20190124184929' },
    { name: 'Chrollo Lucifer', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/7/78/Chrollo_Lucilfer_GI_Portrait.png/revision/latest?cb=20130502190618' },
    { name: 'Nobunaga', img: 'https://static.wikia.nocookie.net/hunterxhunter/images/4/46/HxH2011_EP50_Nobunaga_Portrait.png/revision/latest?cb=20230122183803' },
]

export interface ITemplate {
    id: string
    name: string
    description: string
    topics: ITopic[]
    /** criada pelo usuário (pode ser excluída) */
    custom?: boolean
}

export const templates: ITemplate[] = [
    {
        id: 'hxh-characters',
        name: 'Hunter x Hunter — Personagens',
        description: 'Os personagens principais e a Brigada Fantasma',
        topics: hxhTopics,
    },
    {
        id: 'countries-flags',
        name: 'Países — Bandeiras',
        description: 'Todos os países e territórios com suas bandeiras',
        topics: countries.map((c) => ({ name: c.name, img: c.flags.svg })),
    },
]
