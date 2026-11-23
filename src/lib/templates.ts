// Templates de ranking. Cada arquivo em src/assets/templates/*.json é um template:
//   { "id": "...", "name": "...", "description": "...", "topics": [{ "name": "...", "img": "url" }] }
// Para criar um novo, basta adicionar um .json nessa pasta (o id precisa ser único).
// Os tópicos vêm sem id; o id é atribuído ao abrir o template.

export interface ITemplate {
    id: string
    name: string
    description: string
    topics: ITopic[]
    /** criada pelo usuário (pode ser excluída) */
    custom?: boolean
}

const files = import.meta.glob<ITemplate>('../assets/templates/*.json', { eager: true, import: 'default' })

export const templates: ITemplate[] = Object.values(files)
    .filter((t) => t?.id && t.name && Array.isArray(t.topics))
    .sort((a, b) => a.name.localeCompare(b.name))
