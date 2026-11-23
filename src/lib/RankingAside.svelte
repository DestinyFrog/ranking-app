<script lang="ts">
    import UlTopic from "./UlTopic.svelte"
    import AddTopic from "./AddTopic.svelte"
    import { ui, setTopicImage } from "./store.svelte"

    // reduz a imagem colada (print de tela é grande e o salvamento local tem cota)
    async function shrink(file: Blob, max = 400): Promise<string> {
        const bmp = await createImageBitmap(file)
        const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
        const c = document.createElement("canvas")
        c.width = Math.round(bmp.width * k)
        c.height = Math.round(bmp.height * k)
        c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
        return c.toDataURL("image/jpeg", 0.85)
    }

    $effect(() => {
        async function onpaste(ev: ClipboardEvent) {
            const id = ui.pasteId
            if (id === null || !ev.clipboardData) return
            const file = [...ev.clipboardData.files].find((f) => f.type.startsWith("image/"))
            const text = ev.clipboardData.getData("text").trim()
            if (file) {
                ev.preventDefault()
                setTopicImage(id, await shrink(file).catch(() => URL.createObjectURL(file)))
            } else if (/^https?:\/\/\S+$/.test(text)) {
                ev.preventDefault()
                setTopicImage(id, text)
            } else return
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