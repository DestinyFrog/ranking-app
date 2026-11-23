# Tier

App web para montar rankings (tier lists e variações). Existem **templates** com uma lista de **tópicos** (nome + imagem), e a pessoa cria seus **rankings** em cima deles, arrastando os tópicos para tiers, setores ou uma área livre.

Feito com Svelte 5 + TypeScript + Vite. Não há backend: tudo roda no navegador e é salvo em `localStorage`.

## Rodando

```sh
npm install
npm run dev      # servidor de desenvolvimento (base: /ranking-app/)
npm run build    # build de produção em dist/
npm run check    # svelte-check + tsc
```

## Conceitos

| Conceito | O que é |
| --- | --- |
| **Template** | Conjunto de tópicos pronto (ex.: personagens de um anime, bandeiras de países). Vem de um arquivo JSON e é somente leitura. |
| **Biblioteca própria** | Template criado pela pessoa: do zero, ou copiado de um existente escolhendo só alguns tópicos (botão ⧉ no card). Pode ser excluída. |
| **Tópico** | Um item com `name` e `img`. Sem imagem, usa um placeholder com a inicial; clicar nele e colar (Ctrl+V) define a imagem. |
| **Ranking** | O estado de uso de um template: módulos, tiers e onde cada tópico foi colocado. Um ranking por template, salvo automaticamente. |
| **Módulo** | Uma "tela" dentro do ranking. Tipos: `tier` (linhas S, A, B…), `quadrant` (4 setores) e `free` (área livre com formas e texto). Cada módulo tem a sua própria disposição dos tópicos. |

## Fluxo

1. Na **Biblioteca** a pessoa escolhe um template (ou cria uma biblioteca própria).
2. No **Workspace**, os tópicos aparecem na barra lateral. Eles são arrastados para o módulo ativo.
3. Cada mudança é salva sozinha. Ao reabrir o template, o último estado volta.
4. O ranking também pode ser exportado e importado como JSON.

## Estrutura

```
src/
  assets/
    templates/*.json     # um arquivo por template (carregado automaticamente)
    types.d.ts           # tipos globais (ITopic, IModule, IPlacement…)
  lib/
    templates.ts         # lê assets/templates/*.json (import.meta.glob)
    store.svelte.ts      # estado do ranking: tópicos, módulos, linhas de tier, posições
    persist.ts           # localStorage: salvamento por template e índice de bibliotecas próprias
    Library.svelte       # tela inicial: lista, busca, criar biblioteca, criar a partir de outra
    Workspace.svelte     # tela do ranking: módulos, autosave, exportar/importar
    RankingAside.svelte  # barra lateral com os tópicos e o campo de adicionar
    AddTopic.svelte      # adição inline (Enter cria; colar várias linhas cria vários)
    Topic.svelte         # tópico arrastável (Pointer Events: mouse, toque, caneta)
    TierModule / QuadrantModule / FreeModule .svelte
    ModuleRail.svelte    # trilho para trocar/adicionar módulos
scripts/
  script.py              # gera JSON de template de personagens via API do AniList
```

## Adicionando um template

Crie um `.json` em `src/assets/templates/`. Não precisa mexer em código.

```json
{
  "id": "meu-template",
  "name": "Nome exibido",
  "description": "Uma linha de descrição",
  "topics": [
    { "name": "Item 1", "img": "https://exemplo.com/1.png" },
    { "name": "Item 2", "img": "https://exemplo.com/2.png" }
  ]
}
```

- O `id` deve ser **único e estável**: é a chave do salvamento local. Trocá-lo faz o progresso salvo daquele template deixar de aparecer.
- Arquivos sem `id`, `name` ou `topics` são ignorados.
- Os ids dos tópicos são atribuídos ao abrir o template, então não entram no JSON.
- Para personagens de anime, `scripts/script.py` gera esse formato a partir do AniList (`pip install requests`). Copie o resultado para `src/assets/templates/`.

## Onde ficam os dados

Tudo em `localStorage` do navegador, então não é compartilhado entre pessoas nem entre navegadores:

- `tier:save:<templateId>`: o ranking daquele template (tópicos, módulos, tiers, posições).
- `tier:libraries`: índice das bibliotecas próprias (id e título). Os tópicos delas ficam no salvamento de cada uma.

Para levar um ranking a outro lugar, use **Exportar** e **Importar** no cabeçalho do módulo.
