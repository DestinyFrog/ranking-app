<script lang="ts">
    import Library from './lib/Library.svelte'
    import Workspace from './lib/Workspace.svelte'
    import { loadTopics, restore } from './lib/store.svelte'
    import { loadSave } from './lib/persist'
    import type { ITemplate } from './lib/templates'

    let current: ITemplate | null = $state(null)

    function open(t: ITemplate) {
        loadTopics(t.topics)
        // retoma o último salvamento deste template, se houver
        const saved = loadSave(t.id)
        if (saved) try { restore(saved) } catch { /* salvamento corrompido: começa do zero */ }
        current = t
    }
</script>

{#if current}
    <Workspace templateId={current.id} title={current.name} onback={() => (current = null)} />
{:else}
    <Library onopen={open} />
{/if}
