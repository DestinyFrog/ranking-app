<script lang="ts">
    import { tick } from 'svelte'
    import { templates, type ITemplate } from './templates'
    import { listCustom, createCustom, deleteCustom, saveRaw } from './persist'
    import { parseFile } from './transfer'

    const { onopen }: { onopen: (t: ITemplate) => void } = $props()
    let query = $state('')

    const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

    let custom = $state(listCustom())
    const all = $derived([...custom, ...templates])

    let creating = $state(false)
    let title = $state('')
    let titleInput = $state<HTMLInputElement>()

    async function startCreate() {
        creating = true
        await tick()
        titleInput?.focus()
    }
    function cancel() {
        creating = false
        title = ''
    }
    function create(ev: SubmitEvent) {
        ev.preventDefault()
        if (!title.trim()) return titleInput?.focus()
        onopen(createCustom(title)) // abre a tela de módulos já com a biblioteca vazia
    }
    function remove(t: ITemplate) {
        if (!confirm(`Excluir o ranking "${t.name}" e seus tópicos?`)) return
        deleteCustom(t.id)
        custom = custom.filter((c) => c.id !== t.id)
    }

    async function importFile(e: Event) {
        const input = e.currentTarget as HTMLInputElement
        const file = input.files?.[0]
        input.value = ''
        if (!file) return
        try {
            const p = parseFile(await file.text())
            if (p.kind === 'library') {
                onopen({ ...createCustom(p.title), topics: p.topics.map(({ name, img, zoom, ox, oy }) => ({ name, img, zoom, ox, oy })) })
            } else {
                const t = createCustom(p.data.title || 'Ranking importado')
                saveRaw(t.id, t.name, JSON.stringify(p.data))
                onopen({ ...t, topics: p.data.topics })
            }
        } catch (err) {
            alert((err as Error).message)
        }
    }

    // ---- criar a partir de um template existente, escolhendo tópicos ----
    let base = $state<ITemplate | null>(null)
    let forkTitle = $state('')
    let forkQuery = $state('')
    let picked = $state(new Set<number>()) // índices em base.topics

    function startFork(t: ITemplate) {
        base = t
        forkTitle = `${t.name} (cópia)`
        forkQuery = ''
        picked = new Set()
    }
    const forkVisible = $derived(
        (base?.topics ?? []).map((t, i) => ({ t, i })).filter(({ t }) => norm(t.name).includes(norm(forkQuery.trim()))),
    )
    function toggle(i: number) {
        const n = new Set(picked)
        n.has(i) ? n.delete(i) : n.add(i)
        picked = n
    }
    function pickVisible(on: boolean) {
        const n = new Set(picked)
        for (const { i } of forkVisible) on ? n.add(i) : n.delete(i)
        picked = n
    }
    function createFork(ev: SubmitEvent) {
        ev.preventDefault()
        if (!base || !picked.size || !forkTitle.trim()) return
        const topics = base.topics.filter((_, i) => picked.has(i)).map(({ name, img }) => ({ name, img }))
        onopen({ ...createCustom(forkTitle), topics }) // o autosave do workspace grava os tópicos
    }

    const filtered = $derived(
        all.filter((t) => norm(`${t.name} ${t.description}`).includes(norm(query.trim()))),
    )
</script>

<main>
{#if base}
    <h1>Novo a partir de “{base.name}”</h1>
    <form class="fork" onsubmit={createFork}>
        <input bind:value={forkTitle} placeholder="Título da nova biblioteca" maxlength="60" required aria-label="Título da nova biblioteca" />
        <button type="submit" disabled={!picked.size}>Criar com {picked.size} {picked.size === 1 ? 'tópico' : 'tópicos'}</button>
        <button type="button" class="ghost" onclick={() => (base = null)}>Cancelar</button>
    </form>
    <div class="bar">
        <input type="search" placeholder="Buscar tópico…" aria-label="Buscar tópico" bind:value={forkQuery} />
        <button type="button" class="ghost" onclick={() => pickVisible(true)}>Selecionar {forkQuery.trim() ? 'filtrados' : 'todos'}</button>
        <button type="button" class="ghost" onclick={() => pickVisible(false)}>Limpar</button>
    </div>
    <ul class="picker">
        {#each forkVisible as { t, i } (i)}
            <li>
                <button type="button" class:on={picked.has(i)} aria-pressed={picked.has(i)} onclick={() => toggle(i)}>
                    <img src={t.img} alt="" loading="lazy" />
                    <span>{t.name}</span>
                    {#if picked.has(i)}<b class="tick">✓</b>{/if}
                </button>
            </li>
        {:else}
            <p class="empty">Nenhum tópico encontrado.</p>
        {/each}
    </ul>
{:else}
    <h1>Biblioteca de rankings</h1>
    {#if creating}
        <form class="create" onsubmit={create} onkeydown={(e) => e.key === 'Escape' && cancel()}>
            <input bind:this={titleInput} bind:value={title} placeholder="Título da biblioteca" maxlength="60" required />
            <button type="submit">Criar</button>
            <button type="button" onclick={cancel}>Cancelar</button>
        </form>
    {:else}
        <div class="actions">
            <button type="button" class="new" onclick={startCreate}>+ Nova biblioteca</button>
            <label class="new import" title="Importar um ranking ou uma biblioteca exportados em JSON">
                Importar arquivo<input type="file" accept="application/json,.json" onchange={importFile} hidden />
            </label>
        </div>
    {/if}
    <input type="search" placeholder="Pesquisar templates…" aria-label="Pesquisar templates" bind:value={query} />

    {#if filtered.length}
        <ul>
            {#each filtered as t (t.id)}
                <li>
                    {#if t.custom}
                        <button type="button" class="del" onclick={() => remove(t)} aria-label="Excluir ranking" title="Excluir ranking">×</button>
                    {/if}
                    <button type="button" class="fork-btn" class:shift={t.custom} onclick={() => startFork(t)} aria-label="Criar novo a partir deste" title="Criar novo a partir deste, escolhendo tópicos">⧉</button>
                    <button class="card" class:mine={t.custom} onclick={() => onopen(t)}>
                        <span class="badge" class:mine={t.custom}>{t.custom ? '● Local' : '◆ Nativo'}</span>
                        <span class="thumbs">
                            {#each t.topics.slice(0, 4) as topic (topic.name)}
                                <img src={topic.img} alt="" loading="lazy" />
                            {/each}
                        </span>
                        <strong>{t.name}</strong>
                        <small>{t.description} · {t.topics.length} {t.topics.length === 1 ? 'item' : 'itens'}</small>
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="empty">Nenhum template encontrado.</p>
    {/if}
{/if}
</main>

<style>
main {
    flex: 1;
    min-width: 0;
    max-width: 900px;
    margin: 0 auto;
    padding: 24px var(--gap);
    overflow-y: auto;
}
h1 { font-size: 22px; margin-bottom: var(--gap); }
input {
    width: 100%;
    padding: 8px 10px;
    margin-bottom: 16px;
    border: var(--border-width) solid var(--color-surface);
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    font-size: 14px;
}
ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--gap);
    list-style: none;
}
li button {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    padding: var(--gap);
    border: 0;
    background-color: var(--color-surface);
    color: var(--color-text);
    text-align: left;
    cursor: pointer;
}
li button:hover { outline: var(--border-width) solid var(--color-accent); }
small { opacity: 0.7; }
li { position: relative; }
.fork-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
    width: 24px;
    height: 24px;
    padding: 0;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
    border: 0;
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    cursor: pointer;
    opacity: 0;
}
.fork-btn.shift { right: 32px; }
li:hover .fork-btn, .fork-btn:focus-visible { opacity: 1; }
.fork-btn:hover { background-color: var(--color-accent); }

.fork { display: flex; flex-wrap: wrap; gap: var(--gap); margin-bottom: 16px; }
.fork input { margin-bottom: 0; flex: 1; }
.fork button, .bar button {
    padding: 8px 12px;
    border: 0;
    background-color: var(--color-accent);
    color: var(--color-text);
    font-size: 14px;
    cursor: pointer;
}
.fork button:disabled { opacity: 0.4; cursor: default; }
.fork .ghost, .bar .ghost { background-color: var(--color-surface); }
.bar { display: flex; flex-wrap: wrap; gap: var(--gap); margin-bottom: 16px; }
.bar input { margin-bottom: 0; flex: 1; }
.picker { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
.picker li button {
    position: relative;
    padding: 4px;
    gap: 4px;
    border: var(--border-width) solid transparent;
    text-align: center;
    font-size: 12px;
}
.picker li button.on { border-color: var(--color-accent); background-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-surface)); }
.picker img { width: 100%; aspect-ratio: 1; object-fit: cover; }
.picker span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tick {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    background-color: var(--color-accent);
    font-size: 12px;
}
.del {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
    width: 24px;
    height: 24px;
    padding: 0;
    align-items: center;
    justify-content: center;
    border: 0;
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    cursor: pointer;
}
.new, .create button {
    padding: 8px 12px;
    border: 0;
    background-color: var(--color-accent);
    color: var(--color-text);
    font-size: 14px;
    cursor: pointer;
}
.new { margin-bottom: 16px; }
.actions { display: flex; flex-wrap: wrap; gap: var(--gap); }
.import { background-color: var(--color-surface) !important; display: inline-block; }
.card { border-left: 4px solid var(--color-surface-dark) !important; }
.card.mine { border-left-color: var(--color-accent) !important; }
.badge {
    align-self: flex-start;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    opacity: 0.8;
}
.badge.mine { background-color: var(--color-accent); opacity: 1; }
.create { display: flex; flex-wrap: wrap; gap: var(--gap); margin-bottom: 16px; }
.create input { margin-bottom: 0; flex: 1; }
.create button[type='button'] { background-color: var(--color-surface); }
.thumbs { display: flex; gap: 2px; height: 60px; }
.thumbs img { flex: 1; min-width: 0; object-fit: cover; }
.empty { opacity: 0.7; }
</style>
