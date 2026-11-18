<script lang="ts">
    import DisplaySelect from "./DisplaySelect.svelte"
    import Topic from "./Topic.svelte"
    import { board, getPlacement } from "./store.svelte"
</script>

<ul class="ul-topic">
    <li class="option">
        <DisplaySelect />
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
    margin-bottom: var(--gap);
    width: 100%;
}
</style>
