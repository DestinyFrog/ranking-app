<script lang="ts">
    import UlTopic from "./UlTopic.svelte"
    import AddTopic from "./AddTopic.svelte"
    import TopicEditor from "./TopicEditor.svelte"
    import { ui, setTopicImage, imageFromClipboard } from "./store.svelte"

    $effect(() => {
        async function onpaste(ev: ClipboardEvent) {
            const id = ui.pasteId
            if (id === null || !ev.clipboardData) return
            const img = await imageFromClipboard(ev)
            if (!img) return
            ev.preventDefault()
            setTopicImage(id, img)
            ui.pasteId = null
        }
        // qualquer clique fora cancela; clicar num tópico sem imagem o seleciona de novo
        const cancel = () => (ui.pasteId = null)
        const esc = (e: KeyboardEvent) => e.key === "Escape" && cancel()
        window.addEventListener("paste", onpaste)
        window.addEventListener("pointerdown", cancel)
        window.addEventListener("keydown", esc)
        return () => {
            window.removeEventListener("paste", onpaste)
            window.removeEventListener("pointerdown", cancel)
            window.removeEventListener("keydown", esc)
            ui.pasteId = null
        }
    })
</script>

<aside id="left-bar">
    <UlTopic></UlTopic>
    <AddTopic />
    <TopicEditor />
</aside>

<style>
#left-bar {
    --padding: calc(var(--gap) * 2);
    box-sizing: border-box;
    flex-shrink: 0;
    width: calc(var(--cell-size) + var(--padding) * 2 + 4px); /* + barra de rolagem vertical */
    height: 100%;
    padding: var(--padding);
    background-color: var(--color-surface);
    overflow-y: auto;
    overflow-x: hidden;
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