<script lang="ts">
    import Switch from "./Switch.svelte"
    import Topic from "./Topic.svelte"
    import { board, getPlacement } from "./store.svelte"
</script>

<ul class="ul-topic">
    <li class="option">
        <Switch bind:checked={board.showHeader} label="Apenas Nomes" disabled={board.showHeader && !board.showImage}></Switch>
        <span>Nomes</span>
    </li>
    <li class="option">
        <Switch bind:checked={board.showImage} label="Apenas Imagens" disabled={!board.showHeader && board.showImage}></Switch>
        <span>Imagens</span>
    </li>

    {#each board.topics as topic (topic.id)}
        {#if !getPlacement(board.active, topic.id)?.place}
            <Topic {topic} moduleId={board.active} />
        {/if}
    {/each}
</ul>

<style>
.ul-topic {
    list-style: none;
}

.option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-bottom: var(--gap);
    padding: 6px 0;
    background-color: var(--color-surface-dark);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.9;
    border-radius: 4px;
    width: 100%;
}
</style>
