<script lang="ts">
    import { board, edit, updateTopic, deleteTopic, isPlaceholder, imageFromClipboard } from "./store.svelte"

    const topic = $derived(board.topics.find((t) => t.id === edit.id))
    let name = $state("")
    let img = $state("")

    $effect(() => {
        if (topic) {
            name = topic.name
            img = isPlaceholder(topic) ? "" : topic.img.startsWith("data:") ? "" : topic.img
        }
    })

    let newImg = $state<string | null>(null) // imagem colada (arquivo)
    $effect(() => { edit.id; newImg = null })

    const close = () => (edit.id = null)

    async function onpaste(ev: ClipboardEvent) {
        const v = await imageFromClipboard(ev)
        if (!v) return
        ev.preventDefault()
        if (v.startsWith("data:") || v.startsWith("blob:")) { newImg = v; img = "" } else { img = v; newImg = null }
    }

    function save(ev: SubmitEvent) {
        ev.preventDefault()
        if (!topic) return
        const next = newImg ?? (img.trim() || undefined) // vazio: mantém a imagem atual
        updateTopic(topic.id!, { name, img: next })
        close()
    }

    function remove() {
        if (!topic || !confirm(`Excluir "${topic.name}"?`)) return
        deleteTopic(topic.id!)
        close()
    }

    function resetImage() {
        newImg = null
        img = ""
        if (topic) updateTopic(topic.id!, { img: "" })
    }
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && close()} />

{#if topic}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="backdrop" onpointerdown={(e) => e.stopPropagation()} onclick={(e) => e.target === e.currentTarget && close()}>
        <form class="card" onsubmit={save}>
            <img src={newImg ?? topic.img} alt="" />
            <label>Nome <input bind:value={name} /></label>
            <label>Imagem <input bind:value={img} {onpaste} placeholder="Cole uma imagem ou link" /></label>
            <div class="actions">
                <button type="button" class="danger" onclick={remove}>Excluir</button>
                <button type="button" onclick={resetImage}>Remover imagem</button>
                <span></span>
                <button type="button" onclick={close}>Cancelar</button>
                <button type="submit" class="primary">Salvar</button>
            </div>
        </form>
    </div>
{/if}

<style>
    .backdrop {
        position: fixed; inset: 0; z-index: 100000;
        display: grid; place-items: center;
        background: rgb(0 0 0 / 0.55);
    }
    .card {
        display: flex; flex-direction: column; gap: 10px;
        width: min(320px, 90vw); padding: 16px;
        background: var(--color-surface); color: var(--color-text);
        border: var(--border-width) solid var(--color-accent); border-radius: var(--radius);
    }
    img { width: 96px; height: 96px; object-fit: cover; align-self: center; border-radius: var(--radius); }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    input {
        padding: 6px; background: var(--color-surface-dark); color: var(--color-text);
        border: var(--border-width) solid var(--color-accent); border-radius: var(--radius);
    }
    .actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .actions span { flex: 1; }
    button {
        padding: 6px 10px; cursor: pointer; color: var(--color-text);
        background: var(--color-surface-dark); border: var(--border-width) solid var(--color-accent); border-radius: var(--radius);
    }
    .primary { background: var(--color-accent); }
    .danger { border-color: #c0392b; color: #ff8a7a; }
</style>
