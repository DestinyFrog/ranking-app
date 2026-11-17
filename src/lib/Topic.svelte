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
let offset_x = $state(0)
let offset_y = $state(0)

function ondragstart(ev: DragEvent) {
    const rect = element.getBoundingClientRect()
    offset_x = ev.clientX - rect.left
    offset_y = ev.clientY - rect.top

    const ghost = element.cloneNode(true) as HTMLLIElement
    ghost.style.position = 'fixed'
    ghost.style.top = '-1000px'
    ghost.style.left = '0'
    ghost.style.width = `${rect.width}px`
    document.body.appendChild(ghost)
    ev.dataTransfer?.setDragImage(ghost, offset_x, offset_y)
    setTimeout(() => ghost.remove(), 0)
}

function ondragend(ev: DragEvent) {
    // alguns navegadores reportam (0, 0) quando o drop ocorre fora da janela
    if (ev.clientX === 0 && ev.clientY === 0) return
    biggestZIndex++
    element.style.zIndex = biggestZIndex.toString()
    element.style.position = 'fixed'
    element.style.left = `${ev.clientX - offset_x}px`
    element.style.top = `${ev.clientY - offset_y}px`
}
</script>

<li class="topic"
    draggable="true"
    ondragstart={ondragstart}
    ondragend={ondragend}
    bind:this={element}>

    {#if showOnlyHeader}
        <header
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