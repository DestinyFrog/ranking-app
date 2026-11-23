<script lang="ts">
    import Library from './lib/Library.svelte'
    import Workspace from './lib/Workspace.svelte'
    import { loadTopics, restore } from './lib/store.svelte'
    import { loadSave, newId } from './lib/persist'
    import type { ITemplate } from './lib/templates'

    let current: ITemplate | null = $state(null)
    let fresh = $state(false)

    function open(t: ITemplate) {
        loadTopics(t.topics)
        if (t.custom) {
            // ranking seu: retoma o salvamento
            const saved = loadSave(t.id)
            if (saved) try { restore(saved) } catch { /* salvamento corrompido: começa do zero */ }
            fresh = false
            current = t
        } else {
            // template nativo: abre uma cópia; o original nunca muda
            fresh = true
            current = { ...t, id: newId(), custom: true }
        }
    }
</script>

{#if current}
    <Workspace {fresh} templateId={current.id} title={current.name} onback={() => (current = null)} />
{:else}
    <Library onopen={open} />
{/if}
