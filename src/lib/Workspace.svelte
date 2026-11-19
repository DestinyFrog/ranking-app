<script lang="ts">
    import RankingAside from "./RankingAside.svelte"
    import ModuleRail from "./ModuleRail.svelte"
    import TierModule from "./TierModule.svelte"
    import QuadrantModule from "./QuadrantModule.svelte"
    import FreeModule from "./FreeModule.svelte"
    import { board, clearModule } from "./store.svelte"

    interface Props {
        title: string
        onback: () => void
    }
    const { title, onback }: Props = $props()

    const defaultNames: Record<ModuleType, string> = {
        tier: 'Tier',
        quadrant: '4 setores',
        free: 'Área livre',
    }

    let nextId = 4
    let modules: IModule[] = $state([
        { id: 1, type: 'tier', name: 'Tier' },
        { id: 2, type: 'quadrant', name: '4 setores' },
        { id: 3, type: 'free', name: 'Área livre' },
    ])
    let activeId = $state(1)

    // o módulo visível define qual disposição de tópicos a barra mostra
    $effect.pre(() => { board.active = activeId })

    function add(type: ModuleType) {
        const id = nextId++
        modules.push({ id, type, name: defaultNames[type] })
        activeId = id
    }

    function remove(id: number) {
        if (modules.length === 1) return
        const i = modules.findIndex((m) => m.id === id)
        modules.splice(i, 1)
        clearModule(id)
        if (activeId === id) activeId = modules[Math.max(0, i - 1)].id
    }
</script>

<ModuleRail {modules} {activeId} onselect={(id) => (activeId = id)} onadd={add} />
<RankingAside />

<main>
    <!-- todos ficam montados (só escondidos) para não perder o estado ao trocar de módulo -->
    {#each modules as m (m.id)}
        <section class="module" hidden={m.id !== activeId}>
            <header>
                <button class="back" onclick={onback} title="Voltar para a biblioteca">← Biblioteca</button>
                <span class="title">{title}</span>
                <input bind:value={m.name} aria-label="Nome do módulo" maxlength="40" />
                <button onclick={() => remove(m.id)} disabled={modules.length === 1} title="Excluir módulo">Excluir módulo</button>
            </header>
            <div class="body">
                {#if m.type === 'tier'}
                    <TierModule moduleId={m.id} />
                {:else if m.type === 'quadrant'}
                    <QuadrantModule />
                {:else}
                    <FreeModule active={m.id === activeId} />
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
header button {
    padding: 4px 8px;
    border: 0;
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    font-size: 12px;
    cursor: pointer;
}
header button:disabled { opacity: 0.4; cursor: default; }

.body {
    flex: 1;
    min-height: 0;
}
</style>
