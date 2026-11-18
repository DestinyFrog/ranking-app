<script lang="ts">
    import UlTopic from "./UlTopic.svelte"
    import AddTopic from "./AddTopic.svelte"

</script>

<aside id="left-bar">
    <AddTopic />
    <UlTopic></UlTopic>
</aside>

<style>
#left-bar {
    --padding: calc(var(--gap) * 2);
    box-sizing: border-box;
    flex-shrink: 0;
    width: calc(var(--cell-size) + var(--padding) * 2);
    height: 100%;
    padding: var(--padding);
    background-color: var(--color-surface);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--color-accent) transparent;
}

#left-bar::-webkit-scrollbar { width: 4px; }
#left-bar::-webkit-scrollbar-track { background: transparent; }
#left-bar::-webkit-scrollbar-thumb {
    background: var(--color-accent);
    border-radius: 999px;
}
#left-bar::-webkit-scrollbar-thumb:hover { background: var(--color-text); }

</style>