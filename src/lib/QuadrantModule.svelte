<script lang="ts">
    import { frame } from './store.svelte'

    const { moduleId }: { moduleId: number } = $props()
    let top = $state('Característica A')
    let bottom = $state('Característica B')
    let left = $state('Característica C')
    let right = $state('Característica D')
</script>

<div class="quadrant">
    <input class="side top" bind:value={top} aria-label="Lado superior" />
    <input class="side left" bind:value={left} aria-label="Lado esquerdo" />
    <div class="plane" data-plane={moduleId} use:frame>
        <div class="axis h"></div>
        <div class="axis v"></div>
    </div>
    <input class="side right" bind:value={right} aria-label="Lado direito" />
    <input class="side bottom" bind:value={bottom} aria-label="Lado inferior" />
</div>

<style>
.quadrant {
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    grid-template-rows: 36px 1fr 36px;
    grid-template-areas:
        '. top .'
        'left plane right'
        '. bottom .';
    height: 100%;
    padding: var(--gap);
    gap: 4px;
}

.side {
    min-width: 0;
    min-height: 0;
    border: 0;
    background-color: var(--color-surface-dark);
    border-bottom: var(--border-width) solid var(--color-accent);
    color: var(--color-text);
    font-size: 14px;
    text-align: center;
}
.side:focus { outline: 1px dashed var(--color-accent); }
.top { grid-area: top; }
.bottom { grid-area: bottom; }
.left { grid-area: left; writing-mode: vertical-rl; transform: rotate(180deg); }
.right { grid-area: right; writing-mode: vertical-rl; }

.plane {
    grid-area: plane;
    position: relative;
    border: var(--border-width) solid var(--color-accent);
    background-color: var(--color-surface-dark);
}

.axis {
    position: absolute;
    background-color: var(--color-accent);
    opacity: 0.6;
}
.axis.h { left: 0; right: 0; top: 50%; height: var(--border-width); }
.axis.v { top: 0; bottom: 0; left: 50%; width: var(--border-width); }
</style>
