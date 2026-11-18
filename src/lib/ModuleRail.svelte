<script lang="ts">
    interface Props {
        modules: IModule[]
        activeId: number
        onselect: (id: number) => void
        onadd: (type: ModuleType) => void
    }

    const { modules, activeId, onselect, onadd }: Props = $props()
    let menuOpen = $state(false)

    const types: { type: ModuleType; label: string; icon: string }[] = [
        { type: 'tier', label: 'Tier (S, A, B…)', icon: '☰' },
        { type: 'quadrant', label: '4 setores', icon: '✚' },
        { type: 'free', label: 'Área livre', icon: '✎' },
    ]
    const iconOf = (t: ModuleType) => types.find((x) => x.type === t)!.icon
</script>

<nav class="rail" aria-label="Módulos">
    {#each modules as m (m.id)}
        <button class="item" class:active={m.id === activeId} title={m.name} aria-label={m.name}
            onclick={() => onselect(m.id)}>{iconOf(m.type)}</button>
    {/each}

    <div class="add">
        <button class="item" title="Novo módulo" aria-label="Novo módulo" aria-expanded={menuOpen}
            onclick={() => (menuOpen = !menuOpen)}>+</button>
        {#if menuOpen}
            <ul class="menu">
                {#each types as t}
                    <li><button onclick={() => { onadd(t.type); menuOpen = false }}>{t.icon} {t.label}</button></li>
                {/each}
            </ul>
        {/if}
    </div>
</nav>

<style>
.rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    gap: 4px;
    width: 32px;
    height: 100%;
    padding: 6px 0;
    background-color: var(--color-surface-dark);
    overflow-y: auto;
    scrollbar-width: none;
}

.item {
    width: 24px;
    height: 24px;
    border: 0;
    border-left: var(--border-width) solid transparent;
    background: transparent;
    color: var(--color-text);
    font-size: 14px;
    opacity: 0.6;
    cursor: pointer;
}
.item:hover { opacity: 1; }
.item.active {
    opacity: 1;
    background-color: var(--color-surface);
    border-left-color: var(--color-accent);
}

.add { position: relative; margin-top: auto; }

.menu {
    position: fixed;
    left: 36px;
    bottom: 10px;
    z-index: 2000000;
    list-style: none;
    background-color: var(--color-surface);
    border: var(--border-width) solid var(--color-accent);
}
.menu button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: 0;
    background: transparent;
    color: var(--color-text);
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
}
.menu button:hover { background-color: var(--color-surface-dark); }
</style>
