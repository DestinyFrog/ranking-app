<script lang="ts">
    import { tick } from 'svelte'
    import { templates, type ITemplate } from './templates'
    import { listCustom, createCustom, deleteCustom } from './persist'

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
        if (!confirm(`Excluir a biblioteca "${t.name}" e seus tópicos?`)) return
        deleteCustom(t.id)
        custom = custom.filter((c) => c.id !== t.id)
    }

    const filtered = $derived(
        all.filter((t) => norm(`${t.name} ${t.description}`).includes(norm(query.trim()))),
    )
</script>

<main>
    <h1>Biblioteca de rankings</h1>
    {#if creating}
        <form class="create" onsubmit={create} onkeydown={(e) => e.key === 'Escape' && cancel()}>
            <input bind:this={titleInput} bind:value={title} placeholder="Título da biblioteca" maxlength="60" required />
            <button type="submit">Criar</button>
            <button type="button" onclick={cancel}>Cancelar</button>
        </form>
    {:else}
        <button type="button" class="new" onclick={startCreate}>+ Nova biblioteca</button>
    {/if}
    <input type="search" placeholder="Pesquisar templates…" aria-label="Pesquisar templates" bind:value={query} />

    {#if filtered.length}
        <ul>
            {#each filtered as t (t.id)}
                <li>
                    {#if t.custom}
                        <button type="button" class="del" onclick={() => remove(t)} aria-label="Excluir biblioteca" title="Excluir biblioteca">×</button>
                    {/if}
                    <button onclick={() => onopen(t)}>
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
.create { display: flex; gap: var(--gap); margin-bottom: 16px; }
.create input { margin-bottom: 0; flex: 1; }
.create button[type='button'] { background-color: var(--color-surface); }
.thumbs { display: flex; gap: 2px; height: 60px; }
.thumbs img { flex: 1; min-width: 0; object-fit: cover; }
.empty { opacity: 0.7; }
</style>
