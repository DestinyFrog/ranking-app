<script lang="ts">
    import { board } from "./store.svelte"

    // --cell-size alimenta tópicos, barra lateral e linhas: muda todos de uma vez
    $effect(() => {
        document.documentElement.style.setProperty("--cell-size", `${board.size}px`)
        return () => document.documentElement.style.removeProperty("--cell-size")
    })
</script>

<input type="range" min="50" max="140" step="2" bind:value={board.size}
    aria-label="Largura dos tópicos" title="Largura dos tópicos: {board.size}px" />

<style>
    input {
        box-sizing: border-box;
        width: 100%;
        margin: 4px 0 0;
        accent-color: var(--color-accent);
        cursor: pointer;
    }
</style>
