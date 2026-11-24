<script lang="ts">
    import { addTopic, imageFromClipboard } from "./store.svelte"

    let name = $state("")
    let img = $state("")

    // Enter cria o tópico e o foco continua no campo, pronto para o próximo
    function submit(ev: SubmitEvent) {
        ev.preventDefault()
        if (!name.trim()) return
        addTopic(name, img)
        name = ""
        img = ""
    }

    // cola imagem ou link no campo de imagem
    async function onimgpaste(ev: ClipboardEvent) {
        const v = await imageFromClipboard(ev)
        if (!v) return
        ev.preventDefault()
        img = v
    }

    // colar várias linhas cria um tópico por linha
    function onpaste(ev: ClipboardEvent) {
        const text = ev.clipboardData?.getData("text") ?? ""
        if (!/\r?\n/.test(text)) return
        ev.preventDefault()
        for (const line of text.split(/\r?\n/)) if (line.trim()) addTopic(line, "")
        name = ""
    }
</script>

<form onsubmit={submit}>
    <input bind:value={name} {onpaste} placeholder="+ Tópico" aria-label="Adicionar tópico (Enter para criar)" enterkeyhint="done" />
    <div class="img">
        <input bind:value={img} onpaste={onimgpaste} placeholder="Imagem: cole ou link" aria-label="Imagem do tópico (cole uma imagem ou link)" />
        {#if img}<button type="button" onclick={() => (img = "")} aria-label="Remover imagem">×</button>{/if}
    </div>
</form>

<style>
    form {
        position: sticky;
        bottom: 0;
        width: var(--cell-size);
        padding-top: var(--gap);
        background-color: var(--color-surface);
    }

    .img { display: flex; gap: 2px; margin-top: 4px; }
    button {
        background: none; border: 0; color: var(--color-text); cursor: pointer; padding: 0 4px;
    }

    input {
        width: 100%;
        min-width: 0;
        padding: 6px 4px;
        background: var(--color-surface-dark);
        border: var(--border-width) dashed var(--color-accent);
        border-radius: var(--radius);
        color: var(--color-text);
        font-size: 12px;
    }
    input::placeholder {
        color: var(--color-text);
        opacity: 0.6;
    }
    input:focus {
        outline: none;
        border-style: solid;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 35%, transparent);
    }
</style>
