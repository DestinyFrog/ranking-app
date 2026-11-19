<script lang="ts">
    import { tick } from "svelte"
    import { addTopic } from "./store.svelte"

    let open = $state(false)
    let name = $state("")
    let img = $state("")
    let nameInput = $state<HTMLInputElement>()

    async function toggle() {
        open = !open
        if (open) {
            await tick()
            nameInput?.focus()
        }
    }

    function close() {
        open = false
        name = ""
        img = ""
    }

    function submit(ev: SubmitEvent) {
        ev.preventDefault()
        if (!name.trim()) return nameInput?.focus()
        addTopic(name, img)
        close()
    }

    function onfile(ev: Event) {
        const file = (ev.currentTarget as HTMLInputElement).files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => (img = reader.result as string)
        reader.readAsDataURL(file)
    }
</script>

<button type="button" id="add-topic-button" aria-expanded={open} aria-label="Adicionar tópico" onclick={toggle}>
    {open ? "×" : "+"}
</button>

{#if open}
    <form onsubmit={submit} onkeydown={(e) => e.key === "Escape" && close()}>
        <input bind:this={nameInput} bind:value={name} placeholder="Nome" required />
        <input bind:value={img} placeholder="URL da imagem" />
        <label class="file">
            Escolher arquivo
            <input type="file" accept="image/*" onchange={onfile} hidden />
        </label>
        <button type="submit">Adicionar</button>
    </form>
{/if}

<style>
    button,
    .file {
        box-sizing: border-box;
        width: var(--cell-size);
        background-color: var(--color-surface-dark);
        border: 0;
        border-bottom: var(--border-width) solid var(--color-accent);
        border-radius: var(--radius) var(--radius) 0 0;
        color: var(--color-text);
        font-size: 16px;
        cursor: pointer;
    }

    #add-topic-button {
        margin-bottom: var(--gap);
        padding: 6px 0;
        background-color: var(--color-accent);
        border-bottom-color: var(--color-text);
        border-radius: var(--radius);
        font-size: 22px;
        font-weight: bold;
        line-height: 1;
        transition:
            transform 0.15s,
            box-shadow 0.2s;
    }
    #add-topic-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 35%, transparent);
    }
    #add-topic-button:focus-visible {
        outline: 2px solid var(--color-text);
        outline-offset: 2px;
    }
    #add-topic-button[aria-expanded="true"] {
        background-color: var(--color-surface-dark);
        border: var(--border-width) solid var(--color-accent);
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: var(--cell-size);
        margin-bottom: var(--gap);
    }

    input:not([hidden]) {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        padding: 4px;
        background: var(--color-surface-dark);
        border: var(--border-width) solid var(--color-accent);
        border-radius: var(--radius);
        color: var(--color-text);
        font-size: 12px;
    }

    .file {
        padding: 4px 0;
        font-size: 12px;
        text-align: center;
    }

    form button {
        font-size: 13px;
        padding: 4px 0;
    }
</style>
