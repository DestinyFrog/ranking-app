
interface IRanking {
    topics: ITopic[]
}

interface ITopic {
    name: string
    img: string
    pos?: {
        x: number
        y: number
    }
}