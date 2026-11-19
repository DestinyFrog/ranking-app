<script lang="ts">
    import DisplaySelect from "./DisplaySelect.svelte"
    import Topic from "./Topic.svelte"
    import { board, getPlacement } from "./store.svelte"

    let query = $state('')
    const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    const matches = (t: ITopic) => norm(t.name).includes(norm(query.trim()))
</script>

<ul class="ul-topic">
    <li class="option">
        <DisplaySelect />
    </li>

    <li class="option">
        <input type="search" placeholder="Buscar…" aria-label="Buscar tópico pelo nome" bind:value={query} />
    </li>

    {#each board.topics as topic (topic.id)}
        {#if matches(topic) && !getPlacement(board.active, topic.id)?.place}
            <Topic {topic} moduleId={board.active} />
        {/if}
    {/each}
</ul>

<style>
.ul-topic {
    /* largura fixa igual à dos tópicos: com a barra de rolagem, 100% ficaria menor */
    width: var(--cell-size);
    list-style: none;
}

input {
    width: 100%;
    padding: 4px 6px;
    border: var(--border-width) solid var(--color-surface-dark);
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    font-size: 12px;
}

.option {
    margin-bottom: var(--gap);
    width: 100%;
}
</style>
