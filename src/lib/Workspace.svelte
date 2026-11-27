<script lang="ts">
    import RankingAside from "./RankingAside.svelte"
    import ModuleRail from "./ModuleRail.svelte"
    import TierModule from "./TierModule.svelte"
    import QuadrantModule from "./QuadrantModule.svelte"
    import FreeModule from "./FreeModule.svelte"
    import { saveRaw, saveNow } from "./persist"
    import { board, frame, addModule, removeModule, snapshot, restore, addTopic, updateTopic } from "./store.svelte"
    import { exportRanking, exportLibrary, parseFile } from "./transfer"
    import { exportTierImage } from "./exportImage"

    interface Props {
        /** id do template de origem (chave do salvamento local) */
        templateId: string
        title: string
        /** clone recém-aberto de um template: só é gravado depois da primeira alteração */
        fresh?: boolean
        onback: () => void
    }
    const { templateId, title, fresh = false, onback }: Props = $props()
    // clone recém-aberto de um template: só vira ranking salvo quando o estado difere do inicial
    let baseline: string | null = null
    let changed = !fresh

    const defaultNames: Record<ModuleType, string> = {
        tier: 'Tier',
        quadrant: '4 setores',
        free: 'Área livre',
    }
    const add = (type: ModuleType) => addModule(type, defaultNames[type])

    // no mobile as barras de módulos e de tópicos viram gavetas: ficam fechadas por padrão
    // para o conteúdo principal ocupar a tela toda, e se abrem pelas abas com ícone
    let railOpen = $state(false)
    let asideOpen = $state(false)
    const closePanels = () => { railOpen = false; asideOpen = false }

    // autosave local: qualquer mudança (inclusive soltar um tópico) regrava, com debounce curto.
    // O snapshot lê todo o estado, então o effect reage sozinho.
    let saveTimer: ReturnType<typeof setTimeout>
    $effect(() => {
        const data = JSON.stringify(snapshot(templateId, title))
        if (fresh && baseline === null) { baseline = data; return } // estado inicial do clone
        if (!changed) {
            if (data === baseline) return // nada mudou de fato: não cria cópia
            changed = true
        }
        clearTimeout(saveTimer)
        saveTimer = setTimeout(() => {
            saveRaw(templateId, title, data)
        }, 150)
    })

    // fechar/recarregar/trocar de aba logo após soltar: grava na hora
    $effect(() => {
        const flush = () => { clearTimeout(saveTimer); if (changed) saveNow(templateId, title) }
        const onVis = () => document.visibilityState === 'hidden' && flush()
        window.addEventListener('pagehide', flush)
        document.addEventListener('visibilitychange', onVis)
        return () => {
            window.removeEventListener('pagehide', flush)
            document.removeEventListener('visibilitychange', onVis)
        }
    })

    function exportRank() { exportRanking(title, snapshot(templateId, title)) }
    function exportLib() { exportLibrary(title, board.topics) }

    async function exportImage(m: IModule) {
        try {
            const failed = await exportTierImage(m.id, title, m.name)
            if (failed) alert(`${failed} ${failed === 1 ? 'imagem não pôde' : 'imagens não puderam'} ser incluídas (bloqueadas pelo servidor de origem).`)
        } catch (err) {
            alert((err as Error).message)
        }
    }

    async function importJson(e: Event) {
        const input = e.currentTarget as HTMLInputElement
        const file = input.files?.[0]
        input.value = ''
        if (!file) return
        try {
            const p = parseFile(await file.text())
            if (p.kind === 'ranking') {
                if (!confirm('Importar este ranking substitui o ranking atual. Continuar?')) return
                restore(p.data)
            } else {
                // biblioteca: acrescenta só os tópicos que ainda não existem
                const have = new Set(board.topics.map((t) => `${t.name}|${t.img}`))
                let n = 0
                for (const t of p.topics) {
                    if (have.has(`${t.name}|${t.img}`)) continue
                    addTopic(t.name, t.img)
                    const { zoom, ox, oy } = t
                    updateTopic(board.topics[board.topics.length - 1].id!, { zoom, ox, oy })
                    n++
                }
                alert(`${n} ${n === 1 ? 'tópico adicionado' : 'tópicos adicionados'} (${p.topics.length - n} já existiam).`)
            }
        } catch (err) {
            alert((err as Error).message)
        }
    }
</script>

<div class="layout">
    <div class="mobile-tabs">
        <button class="tab" class:open={railOpen} aria-label={railOpen ? 'Fechar módulos' : 'Abrir módulos'}
            aria-expanded={railOpen} onclick={() => { railOpen = !railOpen; asideOpen = false }}>☰</button>
        <button class="tab" class:open={asideOpen} aria-label={asideOpen ? 'Fechar tópicos' : 'Abrir tópicos'}
            aria-expanded={asideOpen} onclick={() => { asideOpen = !asideOpen; railOpen = false }}>▦</button>
    </div>

    {#if railOpen || asideOpen}
        <button type="button" class="backdrop" aria-label="Fechar" onclick={closePanels}></button>
    {/if}

    <div class="panel panel-rail" class:open={railOpen}>
        <div class="drawer-spacer rail-spacer" aria-hidden="true"></div>
        <ModuleRail modules={board.modules} activeId={board.active}
            onselect={(id) => { board.active = id; railOpen = false }}
            onadd={(t) => { add(t); railOpen = false }} />
    </div>

    <div class="panel panel-aside" class:open={asideOpen}>
        <div class="drawer-spacer aside-spacer" aria-hidden="true"></div>
        <RankingAside />
    </div>

    <main>
        <!-- todos ficam montados (só escondidos) para não perder o estado ao trocar de módulo -->
        {#each board.modules as m (m.id)}
            <section class="module" hidden={m.id !== board.active}>
                <header>
                    <button class="back" onclick={onback} title="Voltar para a biblioteca">← Biblioteca</button>
                    <span class="title">{title}</span>
                    <input bind:value={m.name} aria-label="Nome do módulo" maxlength="40" />
                    {#if m.type === 'tier'}
                        <button onclick={() => exportImage(m)} title="Baixar um print (PNG) da tierlist">Exportar imagem</button>
                    {/if}
                    <button onclick={exportRank} title="Baixar o ranking completo (tópicos, módulos e posições)">Exportar ranking</button>
                    <button onclick={exportLib} title="Baixar só a biblioteca de tópicos">Exportar biblioteca</button>
                    <label class="btn" title="Importar um ranking (substitui o atual) ou uma biblioteca (acrescenta tópicos)">
                        Importar<input type="file" accept="application/json,.json" onchange={importJson} hidden />
                    </label>
                    <button onclick={() => removeModule(m.id)} disabled={board.modules.length === 1} title="Excluir módulo">Excluir módulo</button>
                </header>
                <div class="body" data-frame={m.id} use:frame>
                    {#if m.type === 'tier'}
                        <TierModule moduleId={m.id} />
                    {:else if m.type === 'quadrant'}
                        <QuadrantModule moduleId={m.id} />
                    {:else}
                        <FreeModule moduleId={m.id} active={m.id === board.active} />
                    {/if}
                </div>
            </section>
        {/each}
    </main>
</div>

<style>
.layout {
    display: flex;
    flex: 1;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    position: relative;
    overflow: hidden;
}

/* no desktop o wrapper some do layout (display:contents): o filho continua
   um item flex normal do .layout, exatamente como antes */
.panel { display: contents; }

.mobile-tabs, .backdrop, .drawer-spacer { display: none; }

main {
    flex: 1;
    min-width: 0;
    height: 100%;
}

.module {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.module[hidden] { display: none; }

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--gap);
    flex-shrink: 0;
    padding: 6px var(--gap);
    background-color: var(--color-surface);
}
header input {
    min-width: 0;
    border: 0;
    background: transparent;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 600;
}
header .title { color: var(--color-accent); font-size: 12px; white-space: nowrap; }
header input { flex: 1; }
header button, header .btn {
    padding: 4px 8px;
    border: 0;
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    font-size: 12px;
    cursor: pointer;
}
header .btn { cursor: pointer; }
header button:disabled { opacity: 0.4; cursor: default; }

.body {
    flex: 1;
    min-height: 0;
}

/* ---- mobile: módulos e tópicos viram gavetas, abertas pelas abas com ícone ---- */
@media (max-width: 760px) {
    .mobile-tabs {
        /* lado a lado (não empilhado) para caber dentro da faixa do cabeçalho
           e não invadir o canvas da Área livre, que também usa o canto superior esquerdo */
        display: flex;
        flex-direction: row;
        position: fixed;
        top: var(--gap);
        left: var(--gap);
        z-index: 3000000;
        gap: 6px;
    }
    .tab {
        width: 36px;
        height: 36px;
        border: var(--border-width) solid var(--color-accent);
        border-radius: var(--radius);
        background-color: var(--color-surface);
        color: var(--color-text);
        font-size: 16px;
        box-shadow: 0 2px 8px rgb(0 0 0 / 0.5);
        cursor: pointer;
    }
    .tab.open { background-color: var(--color-accent); }

    .backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 2500000;
        border: 0;
        background-color: rgb(0 0 0 / 0.45);
        cursor: default;
    }

    .panel {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        bottom: 0;
        /* -100vw (não translateX): "transform" criaria um novo bloco de referência para os
           tópicos arrastados (position:fixed), descontando a largura desta gaveta do arrasto */
        left: -100vw;
        z-index: 2800000;
        max-width: 80vw;
        transition: left 0.2s ease;
        box-shadow: 0 0 16px rgb(0 0 0 / 0.6);
    }
    /* o conteúdo real preenche o resto da gaveta, abaixo do espaçador */
    .panel > :global(*:not(.drawer-spacer)) { flex: 1; min-height: 0; }
    .panel.open { left: 0; }

    /* faixa do topo da gaveta reservada para as abas fixas não cobrirem nada (ex.: o
       seletor de exibição dos tópicos, que ficava embaixo delas) */
    .drawer-spacer {
        display: block;
        flex-shrink: 0;
        height: calc(36px + var(--gap) * 2);
    }
    .rail-spacer { background-color: var(--color-surface-dark); }
    .aside-spacer { background-color: var(--color-surface); }

    header {
        flex-wrap: wrap;
        row-gap: 6px;
        /* espaço para as abas fixas (lado a lado) não cobrirem o botão de voltar */
        padding-left: calc(36px * 2 + 6px + var(--gap) * 2);
    }
    header .title {
        max-width: 28vw;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    header input { min-width: 70px; }
}
</style>
