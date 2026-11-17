<script lang="ts">
interface Props {
    topic: ITopic
    biggestZIndex: number
    showOnlyHeader: boolean
    showOnlyImage: boolean
}

let {
    topic,
    biggestZIndex = $bindable(0),
    showOnlyHeader = $bindable(true),
    showOnlyImage = $bindable(true),
}: Props = $props()

let element: HTMLLIElement
let dragging = false
let offset_x = 0
let offset_y = 0

// Pointer Events cobrem mouse, toque e caneta (o drag HTML5 não funciona em celular)
function onpointerdown(ev: PointerEvent) {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return
    const rect = element.getBoundingClientRect()
    offset_x = ev.clientX - rect.left
    offset_y = ev.clientY - rect.top

    biggestZIndex++
    element.style.zIndex = biggestZIndex.toString()
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

function onpointerup(ev: PointerEvent) {
    dragging = false
    const target = ev.currentTarget as HTMLElement
    if (target.hasPointerCapture(ev.pointerId)) target.releasePointerCapture(ev.pointerId)
}
</script>

<li class="topic"
    bind:this={element}>

    {#if showOnlyHeader}
        <header
            {onpointerdown}
            {onpointermove}
            {onpointerup}
            onpointercancel={onpointerup}
            role="button"
            tabindex="0"
            >
            { topic.name }
        </header>
    {/if}

    {#if showOnlyImage}
        <img src={ topic.img } alt={ topic.name } />
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

    header {
        padding: 4px 0;
        border-bottom: var(--border-width) solid var(--color-accent);
        background-color: var(--color-surface-dark);
        color: var(--color-text);
        text-align: center;
        cursor: pointer;
        user-select: none;
        touch-action: none; // evita o scroll da página ao arrastar com o dedo
        font-size: 13px;
    }

    img {
        display: block;
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
    }
}
</style>