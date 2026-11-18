<script lang="ts">
    import { board } from "./store.svelte"

    const options: { value: TopicDisplay; label: string }[] = [
        { value: "both", label: "Nome + img" },
        { value: "name", label: "Só nome" },
        { value: "image", label: "Só imagem" },
        { value: "sphere", label: "Esfera" },
    ]
</script>

<select bind:value={board.display} aria-label="Tipo de exibição dos tópicos" title="Tipo de exibição">
    {#each options as o}
        <option value={o.value}>{o.label}</option>
    {/each}
</select>

<style>
    select {
        box-sizing: border-box;
        width: 100%;
        padding: 6px 2px;
        background-color: var(--color-surface-dark);
        border: var(--border-width) solid var(--color-accent);
        border-radius: var(--radius);
        color: var(--color-text);
        font-size: 11px;
        cursor: pointer;
    }
    select:focus-visible {
        outline: 2px solid var(--color-text);
        outline-offset: 2px;
    }
</style>
