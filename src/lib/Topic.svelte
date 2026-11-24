<script lang="ts">
import { board, getPlacement, setPlacement, isPlaceholder, ui, edit, frames, frameEl } from "./store.svelte"

let { topic, moduleId }: { topic: ITopic; moduleId: number } = $props()

let element: HTMLLIElement
let dragging = false
let offset_x = 0
let offset_y = 0
let down_x = 0
let down_y = 0

const armed = $derived(ui.pasteId === topic.id)

// Flutuando: posição vem do estado. Durante o arrasto o estilo é manipulado direto
// e só ao soltar o estado é atualizado (assim o componente não remonta no meio do gesto).
const pos = $derived(getPlacement(moduleId, topic.id)?.pos)
const style = $derived.by(() => {
    if (!pos) return ''
    let x = pos.x ?? 0
    let y = pos.y ?? 0
    if (pos.fx !== undefined && pos.fy !== undefined) {
        frames.n // recalcula quando o quadro muda de tamanho
        const r = frameEl(moduleId)?.getBoundingClientRect()
        if (r) {
            x = r.left + pos.fx * r.width
            y = r.top + pos.fy * r.height
        }
    }
    // nunca fica fora da tela depois de encolher a janela
    x = Math.min(Math.max(0, x), Math.max(0, window.innerWidth - (element?.offsetWidth ?? 0)))
    y = Math.min(Math.max(0, y), Math.max(0, window.innerHeight - (element?.offsetHeight ?? 0)))
    return `position:fixed;left:${x}px;top:${y}px;z-index:${pos.z}`
})

// Pointer Events cobrem mouse, toque e caneta (o drag HTML5 não funciona em celular)
function onpointerdown(ev: PointerEvent) {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return
    const rect = element.getBoundingClientRect()
    offset_x = ev.clientX - rect.left
    offset_y = ev.clientY - rect.top
    down_x = ev.clientX
    down_y = ev.clientY

    board.z++
    element.style.zIndex = board.z.toString()
    element.style.position = 'fixed'
    element.style.left = `${rect.left}px`
    element.style.top = `${rect.top}px`

    dragging = true
    ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
}

function onpointermove(ev: PointerEvent) {
    if (!dragging) return
    const maxX = window.innerWidth - element.offsetWidth
    const maxY = window.innerHeight - element.offsetHeight
    const x = Math.min(Math.max(0, ev.clientX - offset_x), Math.max(0, maxX))
    const y = Math.min(Math.max(0, ev.clientY - offset_y), Math.max(0, maxY))
    element.style.left = `${x}px`
    element.style.top = `${y}px`
}

function clearInline() {
    element.style.position = ''
    element.style.left = ''
    element.style.top = ''
    element.style.zIndex = ''
}

// Decide onde o tópico fica ao soltar: barra, linha de tier ou flutuando
function drop(ev: PointerEvent) {
    const rect = element.getBoundingClientRect()
    element.style.pointerEvents = 'none' // para o hit-test não achar o próprio tópico
    const stack = document.elementsFromPoint(ev.clientX, ev.clientY)
    element.style.pointerEvents = ''

    const rowEl = stack.map((e) => e.closest<HTMLElement>('[data-row-id]')).find(Boolean)
    // tópicos flutuantes são filhos do #left-bar no DOM; soltar sobre um deles não conta como soltar na barra
    const isFloating = (e: Element) => e.closest<HTMLElement>('.topic')?.style.position === 'fixed'
    const overBar = stack.some((e) => e.closest('#left-bar') && !isFloating(e))

    if (rowEl && !overBar) {
        const row = Number(rowEl.dataset.rowId)
        const others = board.topics
            .map((t) => ({ t, rank: getPlacement(moduleId, t.id)?.place?.row === row ? getPlacement(moduleId, t.id)!.place!.rank : null }))
            .filter((o) => o.t !== topic && o.rank !== null)
            .sort((a, b) => a.rank! - b.rank!)
        const cx = rect.left + rect.width / 2
        // posição de inserção: depois dos tópicos em linhas acima ou à esquerda do ponto solto
        let at = 0
        others.forEach(({ t }, i) => {
            const li = rowEl.querySelector<HTMLElement>(`[data-id="${t.id}"]`)
            if (!li) return
            const r = li.getBoundingClientRect()
            const above = r.bottom < ev.clientY
            const sameLineLeft = ev.clientY <= r.bottom && ev.clientY >= r.top && r.left + r.width / 2 < cx
            if (above || sameLineLeft) at = i + 1
        })
        const lo = others[at - 1]?.rank ?? (others[at]?.rank ?? 0) - 2
        const hi = others[at]?.rank ?? lo + 2
        clearInline()
        setPlacement(moduleId, topic.id!, { place: { row, rank: (lo + hi) / 2 } })
    } else if (overBar) {
        clearInline()
        setPlacement(moduleId, topic.id!, {})
    } else {
        const x = parseFloat(element.style.left)
        const y = parseFloat(element.style.top)
        const fr = frameEl(moduleId)?.getBoundingClientRect()
        setPlacement(moduleId, topic.id!, {
            pos: fr?.width && fr.height
                ? { fx: (x - fr.left) / fr.width, fy: (y - fr.top) / fr.height, z: board.z }
                : { x, y, z: board.z },
        })
    }
}

function onpointerup(ev: PointerEvent) {
    const target = ev.currentTarget as HTMLElement
    if (dragging && ev.type === 'pointerup') {
        drop(ev)
        // clique sem arrastar num tópico sem imagem: fica pronto para receber Ctrl+V
        const click = Math.hypot(ev.clientX - down_x, ev.clientY - down_y) < 5
        if (click && isPlaceholder(topic)) ui.pasteId = topic.id ?? null
    }
    dragging = false
    if (target.hasPointerCapture(ev.pointerId)) target.releasePointerCapture(ev.pointerId)
}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<li class="topic"
    class:is-sphere={board.display === 'sphere'}
    class:armed
    title={armed ? 'Cole uma imagem ou link (Ctrl+V)' : 'Duplo clique para editar'}
    bind:this={element}
    data-id={topic.id}
    {style}
    {onpointerdown}
    {onpointermove}
    {onpointerup}
    ondblclick={() => (edit.id = topic.id ?? null)}
    oncontextmenu={(e) => { e.preventDefault(); edit.id = topic.id ?? null }}
    onpointercancel={onpointerup}
    role="button"
    tabindex="0">

    {#if board.display === 'sphere'}
        <div class="sphere" style:background-image="url({topic.img})" role="img" aria-label={topic.name} title={topic.name}></div>
    {:else}
        {#if board.display !== 'image'}
            <header>
                { topic.name }
            </header>
        {/if}

        {#if board.display !== 'name'}
            <img src={ topic.img } alt={ topic.name } draggable="false" />
        {/if}
    {/if}
</li>

<style lang="scss">
.topic {
    user-select: none;
    width: var(--cell-size);
    height: min-content;
    margin-bottom: var(--gap);
    border: var(--border-width) solid var(--color-accent);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    touch-action: none; /* evita o scroll da página ao arrastar com o dedo */

    header {
        padding: 4px 0;
        border-bottom: var(--border-width) solid var(--color-accent);
        background-color: var(--color-surface-dark);
        color: var(--color-text);
        text-align: center;
        user-select: none;
        font-size: 13px;
    }

    &.armed {
        outline: var(--border-width) solid var(--color-text);
        outline-offset: 2px;
        animation: armed 1s ease-in-out infinite alternate;
    }

    &.is-sphere {
        border: 0;
        border-radius: 50%;
        overflow: visible;
    }

    .sphere {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        border: var(--border-width) solid var(--color-accent);
        border-radius: 50%;
        background-color: var(--color-topic-bg, #c9c3d6);
        background-size: cover;
        background-position: center;
        box-shadow: 0 4px 10px rgb(0 0 0 / 0.45);
        pointer-events: none;
        overflow: hidden;

        /* sombra no canto inferior dá volume de esfera */
        &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle at 70% 75%, transparent 55%, rgb(0 0 0 / 0.45));
        }
    }   

    img {
        display: block;
        width: 100%;
        aspect-ratio: 3 / 4;
        background-color: var(--color-topic-bg, #c9c3d6); /* aparece atrás de PNGs transparentes */
        object-fit: cover;
        object-position: center top; /* rostos ficam na parte de cima */
        user-select: none;
        touch-action: none;
        -webkit-user-drag: none;
        pointer-events: none;
    }
}

@keyframes armed {
    to { outline-color: var(--color-accent); }
}
</style>
