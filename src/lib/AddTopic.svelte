<script lang="ts">
    import { addTopic } from "./store.svelte"

    let name = $state("")

    // Enter cria o tópico e o foco continua no campo, pronto para o próximo
    function submit(ev: SubmitEvent) {
        ev.preventDefault()
        if (!name.trim()) return
        addTopic(name, "")
        name = ""
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
</form>

<style>
    form {
        position: sticky;
        bottom: 0;
        width: var(--cell-size);
        padding-top: var(--gap);
        background-color: var(--color-surface);
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
