<script lang="ts">
    interface Line { id: number; kind: 'line'; x1: number; y1: number; x2: number; y2: number; color: string }
    interface Circle { id: number; kind: 'circle'; cx: number; cy: number; r: number; color: string }
    interface Text { id: number; kind: 'text'; x: number; y: number; text: string; size: number; color: string }
    type Shape = Line | Circle | Text

    // Formas selecionadas ficam acima dos tópicos (que usam z-index crescente a partir de 1)
    const Z_SELECTED = 1_000_000
    const HANDLE = 8

    let { active = true }: { active?: boolean } = $props()

    let board: HTMLDivElement
    let textInput: HTMLInputElement | undefined = $state()
    let nextId = 1
    let shapes: Shape[] = $state([])
    let selectedId: number | null = $state(null)
    let color = $state('#ffffff')

    const selected = $derived(shapes.find((s) => s.id === selectedId))

    function center() {
        const r = board.getBoundingClientRect()
        return { x: r.width / 2, y: r.height / 2 }
    }

    function add(kind: Shape['kind']) {
        const { x, y } = center()
        const id = nextId++
        shapes.push(
            kind === 'line'
                ? { id, kind, x1: x - 80, y1: y, x2: x + 80, y2: y, color }
                : kind === 'circle'
                  ? { id, kind, cx: x, cy: y, r: 60, color }
                  : { id, kind, x: x - 40, y, text: 'Texto', size: 28, color },
        )
        selectedId = id
        if (kind === 'text') queueMicrotask(() => textInput?.select())
    }

    function remove() {
        shapes = shapes.filter((s) => s.id !== selectedId)
        selectedId = null
    }

    function setColor(c: string) {
        color = c
        if (selected) selected.color = c
    }

    function local(e: PointerEvent) {
        const r = board.getBoundingClientRect()
        return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    function drag(ev: PointerEvent, move: (dx: number, dy: number, e: PointerEvent) => void) {
        ev.stopPropagation()
        ev.preventDefault()
        const sx = ev.clientX
        const sy = ev.clientY
        const onMove = (e: PointerEvent) => move(e.clientX - sx, e.clientY - sy, e)
        const end = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', end)
            window.removeEventListener('pointercancel', end)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', end)
        window.addEventListener('pointercancel', end)
    }

    function moveShape(ev: PointerEvent, s: Shape) {
        selectedId = s.id
        const o = { ...s } as any
        drag(ev, (dx, dy) => {
            if (s.kind === 'line') {
                s.x1 = o.x1 + dx; s.y1 = o.y1 + dy
                s.x2 = o.x2 + dx; s.y2 = o.y2 + dy
            } else if (s.kind === 'circle') {
                s.cx = o.cx + dx; s.cy = o.cy + dy
            } else {
                s.x = o.x + dx; s.y = o.y + dy
            }
        })
    }

    function moveEnd(ev: PointerEvent, s: Line, end: 1 | 2) {
        drag(ev, (_dx, _dy, e) => {
            const p = local(e)
            if (end === 1) { s.x1 = p.x; s.y1 = p.y } else { s.x2 = p.x; s.y2 = p.y }
        })
    }

    function resize(ev: PointerEvent, s: Circle) {
        drag(ev, (_dx, _dy, e) => {
            const p = local(e)
            s.r = Math.max(8, Math.hypot(p.x - s.cx, p.y - s.cy))
        })
    }

    // largura aproximada do texto (para área de clique, seleção e alça)
    const textWidth = (s: Text) => Math.max(1, s.text.length) * s.size * 0.58

    function resizeText(ev: PointerEvent, s: Text) {
        const o = { size: s.size }
        drag(ev, (dx) => {
            s.size = Math.min(200, Math.max(10, o.size + dx / Math.max(1, s.text.length) / 0.58))
        })
    }

    function onkeydown(e: KeyboardEvent) {
        if (!active || selectedId === null) return
        const t = e.target as HTMLElement
        if (t.matches('input, textarea, [contenteditable]')) return
        if (e.key === 'Delete' || e.key === 'Backspace') remove()
        if (e.key === 'Escape') selectedId = null
    }
</script>

<svelte:window {onkeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="free" bind:this={board} onpointerdown={() => (selectedId = null)}>
    {#each shapes as s (s.id)}
        {@const sel = s.id === selectedId}
        <svg class="layer" style:z-index={sel ? Z_SELECTED : 0}>
            {#if s.kind === 'line'}
                <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.color} stroke-width="4" stroke-linecap="round" />
                <!-- área de clique mais larga que o traço -->
                <line class="hit" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="transparent" stroke-width="20"
                    onpointerdown={(e) => moveShape(e, s)} role="presentation" />
                {#if sel}
                    <circle class="handle" cx={s.x1} cy={s.y1} r={HANDLE} onpointerdown={(e) => moveEnd(e, s, 1)} role="presentation" />
                    <circle class="handle" cx={s.x2} cy={s.y2} r={HANDLE} onpointerdown={(e) => moveEnd(e, s, 2)} role="presentation" />
                {/if}
            {:else if s.kind === 'text'}
                <text x={s.x} y={s.y} fill={s.color} font-size={s.size} font-family="sans-serif" font-weight="600"
                    dominant-baseline="middle">{s.text}</text>
                <rect class="hit fill" x={s.x - 4} y={s.y - s.size * 0.65} width={textWidth(s) + 8} height={s.size * 1.3}
                    fill="transparent" onpointerdown={(e) => moveShape(e, s)} role="presentation" />
                {#if sel}
                    <rect class="outline" x={s.x - 4} y={s.y - s.size * 0.65} width={textWidth(s) + 8} height={s.size * 1.3} />
                    <circle class="handle" cx={s.x + textWidth(s) + 4} cy={s.y} r={HANDLE} onpointerdown={(e) => resizeText(e, s)} role="presentation" />
                {/if}
            {:else}
                <circle class="hit fill" cx={s.cx} cy={s.cy} r={s.r} stroke={s.color} stroke-width="4"
                    fill={s.color} fill-opacity="0.12" onpointerdown={(e) => moveShape(e, s)} role="presentation" />
                {#if sel}
                    <circle class="handle" cx={s.cx + s.r} cy={s.cy} r={HANDLE} onpointerdown={(e) => resize(e, s)} role="presentation" />
                {/if}
            {/if}
        </svg>
    {/each}

    <div class="toolbar" onpointerdown={(e) => e.stopPropagation()} role="toolbar" tabindex="-1">
        <button onclick={() => add('line')}>╱ Linha</button>
        <button onclick={() => add('circle')}>○ Círculo</button>
        <button onclick={() => add('text')}>T Texto</button>
        <input type="color" value={selected?.color ?? color} oninput={(e) => setColor(e.currentTarget.value)} aria-label="Cor" />
        {#if selected?.kind === 'text'}
            <input class="text-input" bind:this={textInput} value={selected.text} aria-label="Texto"
                oninput={(e) => { if (selected?.kind === 'text') selected.text = e.currentTarget.value }} />
        {/if}
        <button onclick={remove} disabled={!selected}>Excluir</button>
    </div>

    {#if shapes.length === 0}
        <p class="hint">Adicione linhas, círculos e textos pela barra acima</p>
    {/if}
</div>

<style>
.free {
    position: relative;
    height: 100%;
    background-color: var(--color-surface-dark);
    overflow: hidden;
}

.toolbar {
    position: absolute;
    top: var(--gap);
    left: var(--gap);
    z-index: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
    background-color: var(--color-surface);
    border: var(--border-width) solid var(--color-accent);
}
.toolbar button {
    padding: 4px 8px;
    border: 0;
    background-color: var(--color-surface-dark);
    color: var(--color-text);
    cursor: pointer;
}
.toolbar button:disabled { opacity: 0.4; cursor: default; }
.toolbar input[type='color'] {
    width: 28px;
    height: 24px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
}

.layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* só a forma em si captura cliques */
    overflow: visible;
}
.hit { pointer-events: stroke; cursor: move; touch-action: none; }
.hit.fill { pointer-events: visiblePainted; }
.layer text { user-select: none; }
.outline {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
}
.toolbar .text-input {
    width: 140px;
    padding: 4px 6px;
    border: 1px solid var(--color-accent);
    background-color: var(--color-surface-dark);
    color: var(--color-text);
}
.handle {
    pointer-events: all;
    fill: var(--color-text);
    stroke: var(--color-accent);
    stroke-width: 2;
    cursor: pointer;
    touch-action: none;
}

.hint {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    opacity: 0.4;
    pointer-events: none;
}
</style>
