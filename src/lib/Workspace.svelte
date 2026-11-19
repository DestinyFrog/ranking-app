<script lang="ts">
    import RankingAside from "./RankingAside.svelte"
    import ModuleRail from "./ModuleRail.svelte"
    import TierModule from "./TierModule.svelte"
    import QuadrantModule from "./QuadrantModule.svelte"
    import FreeModule from "./FreeModule.svelte"
    import { saveKey, saveNow } from "./persist"
    import { board, addModule, removeModule, snapshot, restore } from "./store.svelte"

    interface Props {
        /** id do template de origem (chave do salvamento local) */
        templateId: string
        title: string
        onback: () => void
    }
    const { templateId, title, onback }: Props = $props()

    const defaultNames: Record<ModuleType, string> = {
        tier: 'Tier',
        quadrant: '4 setores',
        free: 'Área livre',
    }
    const add = (type: ModuleType) => addModule(type, defaultNames[type])

    // autosave local: qualquer mudança (inclusive soltar um tópico) regrava, com debounce curto.
    // O snapshot lê todo o estado, então o effect reage sozinho.
    let saveTimer: ReturnType<typeof setTimeout>
    $effect(() => {
        const data = JSON.stringify(snapshot(templateId, title))
        clearTimeout(saveTimer)
        saveTimer = setTimeout(() => {
            try { localStorage.setItem(saveKey(templateId), data) } catch { /* cota cheia / bloqueado */ }
        }, 150)
    })

    // fechar/recarregar/trocar de aba logo após soltar: grava na hora
    $effect(() => {
        const flush = () => { clearTimeout(saveTimer); saveNow(templateId, title) }
        const onVis = () => document.visibilityState === 'hidden' && flush()
        window.addEventListener('pagehide', flush)
        document.addEventListener('visibilitychange', onVis)
        return () => {
            window.removeEventListener('pagehide', flush)
            document.removeEventListener('visibilitychange', onVis)
        }
    })

    function exportJson() {
        const blob = new Blob([JSON.stringify(snapshot(templateId, title), null, 2)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${templateId}.tier.json`
        a.click()
        URL.revokeObjectURL(a.href)
    }

    async function importJson(e: Event) {
        const input = e.currentTarget as HTMLInputElement
        const file = input.files?.[0]
        input.value = ''
        if (!file) return
        try {
            restore(JSON.parse(await file.text()))
        } catch (err) {
            alert((err as Error).message)
        }
    }
</script>

<ModuleRail modules={board.modules} activeId={board.active} onselect={(id) => (board.active = id)} onadd={add} />
<RankingAside />

<main>
    <!-- todos ficam montados (só escondidos) para não perder o estado ao trocar de módulo -->
    {#each board.modules as m (m.id)}
        <section class="module" hidden={m.id !== board.active}>
            <header>
                <button class="back" onclick={onback} title="Voltar para a biblioteca">← Biblioteca</button>
                <span class="title">{title}</span>
                <input bind:value={m.name} aria-label="Nome do módulo" maxlength="40" />
                <button onclick={exportJson} title="Baixar o ranking como JSON">Exportar</button>
                <label class="btn" title="Carregar um ranking salvo em JSON">
                    Importar<input type="file" accept="application/json,.json" onchange={importJson} hidden />
                </label>
                <button onclick={() => removeModule(m.id)} disabled={board.modules.length === 1} title="Excluir módulo">Excluir módulo</button>
            </header>
            <div class="body">
                {#if m.type === 'tier'}
                    <TierModule moduleId={m.id} />
                {:else if m.type === 'quadrant'}
                    <QuadrantModule />
                {:else}
                    <FreeModule active={m.id === board.active} />
                {/if}
            </div>
        </section>
    {/each}
</main>

<style>
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
</style>
