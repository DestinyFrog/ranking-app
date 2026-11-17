<script lang="ts">
    import Switch from "./Switch.svelte"
    import Topic from "./Topic.svelte"  

    interface Props {
        topics: ITopic[]
    }
    
    const { topics }: Props = $props()
    let biggestZIndex = $state(0)
    let showOnlyHeader = $state(true)
    let showOnlyImage = $state(true)
</script>

<ul class="ul-topic">
    <li class="option">
        <Switch bind:checked={showOnlyHeader} label="Apenas Nomes" disabled={showOnlyHeader && !showOnlyImage}></Switch>
        <span>Nomes</span>
    </li>
    <li class="option">
        <Switch bind:checked={showOnlyImage} label="Apenas Imagens" disabled={!showOnlyHeader && showOnlyImage}></Switch>
        <span>Imagens</span>
    </li>

    {#each topics as topic}
        <Topic {topic} bind:biggestZIndex {showOnlyHeader} {showOnlyImage} />
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
