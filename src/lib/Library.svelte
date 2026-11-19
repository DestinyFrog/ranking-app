<script lang="ts">
    import { templates, type ITemplate } from './templates'

    const { onopen }: { onopen: (t: ITemplate) => void } = $props()
    let query = $state('')

    const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    const filtered = $derived(
        templates.filter((t) => norm(`${t.name} ${t.description}`).includes(norm(query.trim()))),
    )
</script>

<main>
    <h1>Biblioteca de rankings</h1>
    <input type="search" placeholder="Pesquisar templates…" aria-label="Pesquisar templates" bind:value={query} />

    {#if filtered.length}
        <ul>
            {#each filtered as t (t.id)}
                <li>
                    <button onclick={() => onopen(t)}>
                        <span class="thumbs">
                            {#each t.topics.slice(0, 4) as topic (topic.name)}
                                <img src={topic.img} alt="" loading="lazy" />
                            {/each}
                        </span>
                        <strong>{t.name}</strong>
                        <small>{t.description} · {t.topics.length} itens</small>
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
.thumbs { display: flex; gap: 2px; height: 60px; }
.thumbs img { flex: 1; min-width: 0; object-fit: cover; }
.empty { opacity: 0.7; }
</style>
