<script lang="ts">
    import { tick } from "svelte"
    import { addTopic, imageFromClipboard, imgStyle } from "./store.svelte"

    let open = $state(false)
    let name = $state("")
    let img = $state("")
    let zoom = $state(1)
    let ox = $state(50)
    let oy = $state(0)
    let nameInput = $state<HTMLInputElement>()

    async function show() {
        open = true
        await tick()
        nameInput?.focus()
    }
    const resetFrame = () => { zoom = 1; ox = 50; oy = 0 }
    function close() {
        open = false
        name = ""
        img = ""
        resetFrame()
    }

    // arrastar a prévia move o enquadramento
    let pan: { x: number; y: number; ox: number; oy: number } | null = null
    function panStart(ev: PointerEvent) {
        pan = { x: ev.clientX, y: ev.clientY, ox, oy }
        ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
    }
    function panMove(ev: PointerEvent) {
        if (!pan) return
        const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
        const clamp = (v: number) => Math.min(100, Math.max(0, v))
        const k = 100 / Math.max(zoom - 1, 0.25)
        ox = clamp(pan.ox - ((ev.clientX - pan.x) / r.width) * k)
        oy = clamp(pan.oy - ((ev.clientY - pan.y) / r.height) * k)
    }
    const panEnd = () => (pan = null)

    // "Adicionar" fecha; "Adicionar e continuar" mantém o modal aberto para o próximo
    function submit(ev: SubmitEvent) {
        ev.preventDefault()
        if (!name.trim()) return nameInput?.focus()
        addTopic(name, img, img.trim() ? { zoom, ox, oy } : undefined)
        const keep = (ev.submitter as HTMLElement | null)?.dataset.keep
        name = ""
        img = ""
        resetFrame()
        if (keep) nameInput?.focus()
        else open = false
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

<svelte:window onkeydown={(e) => open && e.key === "Escape" && close()} />

<div class="bar">
    <button type="button" class="add" onclick={show} aria-label="Adicionar tópico" title="Adicionar tópico">+ Tópico</button>
</div>

{#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="backdrop" onpointerdown={(e) => e.stopPropagation()} onclick={(e) => e.target === e.currentTarget && close()}>
        <form class="card" onsubmit={submit}>
            <h2>Novo tópico</h2>
            {#if img}
                <div class="preview" role="img" aria-label="Prévia: arraste para enquadrar"
                    onpointerdown={panStart} onpointermove={panMove} onpointerup={panEnd} onpointercancel={panEnd}>
                    <img src={img} alt="" draggable="false" style={imgStyle({ zoom, ox, oy })} />
                </div>
                <label>Zoom: {zoom.toFixed(1)}×
                    <input type="range" min="1" max="4" step="0.1" bind:value={zoom} />
                </label>
                <div class="pos">
                    <label>Horizontal <input type="range" min="0" max="100" bind:value={ox} /></label>
                    <label>Vertical <input type="range" min="0" max="100" bind:value={oy} /></label>
                </div>
                <button type="button" onclick={resetFrame}>Redefinir enquadramento</button>
            {/if}
            <label>Nome <input bind:this={nameInput} bind:value={name} {onpaste} placeholder="Várias linhas coladas criam vários tópicos" enterkeyhint="done" /></label>
            <label>Imagem
                <span class="img">
                    <input bind:value={img} onpaste={onimgpaste} placeholder="Cole uma imagem ou link" />
                    {#if img}<button type="button" onclick={() => (img = "")} aria-label="Remover imagem">×</button>{/if}
                </span>
            </label>
            <div class="actions">
                <button type="button" onclick={close}>Cancelar</button>
                <span></span>
                <button type="submit" data-keep="1">Adicionar e continuar</button>
                <button type="submit" class="primary">Adicionar</button>
            </div>
        </form>
    </div>
{/if}

<style>
    .bar {
        position: sticky;
        bottom: 0;
        width: var(--cell-size);
        padding-top: var(--gap);
        background-color: var(--color-surface);
    }
    .add {
        width: 100%; padding: 6px 4px; font-size: 12px; cursor: pointer; color: var(--color-text);
        background: var(--color-surface-dark); border: var(--border-width) dashed var(--color-accent); border-radius: var(--radius);
    }
    .add:hover { border-style: solid; }

    .backdrop {
        position: fixed; inset: 0; z-index: 100000;
        display: grid; place-items: center;
        background: rgb(0 0 0 / 0.55);
    }
    .card {
        display: flex; flex-direction: column; gap: 10px;
        box-sizing: border-box; width: min(320px, 90vw); max-height: 90vh; overflow-y: auto; padding: 16px;
        background: var(--color-surface); color: var(--color-text);
        border: var(--border-width) solid var(--color-accent); border-radius: var(--radius);
    }
    h2 { font-size: 16px; margin: 0; }
    .preview {
        width: 120px; aspect-ratio: 3 / 4; align-self: center; overflow: hidden;
        border-radius: var(--radius); background: var(--color-topic-bg, #c9c3d6);
        cursor: grab; touch-action: none;
    }
    .preview img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; user-select: none; }
    .pos { display: flex; gap: 8px; }
    .pos label { flex: 1; min-width: 0; }
    input[type='range'] { padding: 0; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    .img { display: flex; gap: 2px; }
    input {
        width: 100%; min-width: 0; box-sizing: border-box; padding: 6px;
        background: var(--color-surface-dark); color: var(--color-text);
        border: var(--border-width) solid var(--color-accent); border-radius: var(--radius);
    }
    .actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .actions span { flex: 1; }
    .card button {
        padding: 6px 10px; cursor: pointer; color: var(--color-text);
        background: var(--color-surface-dark); border: var(--border-width) solid var(--color-accent); border-radius: var(--radius);
    }
    .img button { padding: 0 8px; }
    .primary { background: var(--color-accent) !important; }
</style>
