<script lang="ts">
    import Library from './lib/Library.svelte'
    import Workspace from './lib/Workspace.svelte'
    import { loadTopics } from './lib/store.svelte'
    import type { ITemplate } from './lib/templates'

    let current: ITemplate | null = $state(null)

    function open(t: ITemplate) {
        loadTopics(t.topics)
        current = t
    }
</script>

{#if current}
    <Workspace title={current.name} onback={() => (current = null)} />
{:else}
    <Library onopen={open} />
{/if}
