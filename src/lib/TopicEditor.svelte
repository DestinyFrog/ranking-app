<script lang="ts">
    import { board, edit, updateTopic, deleteTopic, isPlaceholder, imageFromClipboard, imgStyle } from "./store.svelte"

    const topic = $derived(board.topics.find((t) => t.id === edit.id))
    let name = $state("")
    let img = $state("")
    let zoom = $state(1)
    let ox = $state(50)
    let oy = $state(0)

    $effect(() => {
        if (topic) {
            name = topic.name
            zoom = topic.zoom ?? 1
            ox = topic.ox ?? 50
            oy = topic.oy ?? 0
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
        updateTopic(topic.id!, { name, img: next, zoom, ox, oy })
        close()
    }

    // arrastar a prévia move o enquadramento (o ponto sob o dedo acompanha o cursor)
    let pan: { x: number; y: number; ox: number; oy: number } | null = null
    function panStart(ev: PointerEvent) {
        pan = { x: ev.clientX, y: ev.clientY, ox, oy }
        ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
    }
    function panMove(ev: PointerEvent) {
        if (!pan) return
        const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
        const clamp = (v: number) => Math.min(100, Math.max(0, v))
        // quanto maior o zoom, mais o arrasto precisa andar para cobrir 0–100%
        const k = 100 / Math.max(zoom - 1, 0.25)
        ox = clamp(pan.ox - ((ev.clientX - pan.x) / r.width) * k)
        oy = clamp(pan.oy - ((ev.clientY - pan.y) / r.height) * k)
    }
    const panEnd = () => (pan = null)
    const resetFrame = () => { zoom = 1; ox = 50; oy = 0 }

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
            <div class="preview" role="img" aria-label="Prévia: arraste para enquadrar"
                onpointerdown={panStart} onpointermove={panMove} onpointerup={panEnd} onpointercancel={panEnd}>
                <img src={newImg ?? topic.img} alt="" draggable="false" style={imgStyle({ zoom, ox, oy })} />
            </div>
            <label>Zoom: {zoom.toFixed(1)}×
                <input type="range" min="1" max="4" step="0.1" bind:value={zoom} />
            </label>
            <div class="pos">
                <label>Horizontal <input type="range" min="0" max="100" bind:value={ox} /></label>
                <label>Vertical <input type="range" min="0" max="100" bind:value={oy} /></label>
            </div>
            <button type="button" onclick={resetFrame}>Redefinir enquadramento</button>
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
    .preview {
        width: 120px; aspect-ratio: 3 / 4; align-self: center; overflow: hidden;
        border-radius: var(--radius); cursor: grab; touch-action: none;
        background: var(--color-topic-bg, #c9c3d6);
    }
    .preview img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; user-select: none; }
    .pos { display: flex; gap: 8px; }
    .pos label { flex: 1; }
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
