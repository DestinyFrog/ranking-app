<script lang="ts">
    import UlTopic from "./UlTopic.svelte"

</script>

<aside id="left-bar">
    <button id="add-topic-button">+</button>
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

button {
    background-color: var(--color-surface-dark);
    border: 0;
    border-bottom: var(--border-width) solid var(--color-accent);
    border-radius: var(--radius) var(--radius) 0 0;
    color: var(--color-text);
    font-size: 16px;
    cursor: pointer;
}

#add-topic-button {
    width: 100%;
    margin-bottom: var(--gap);
}

</style>