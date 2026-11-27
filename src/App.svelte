<script lang="ts">
    import Library from './lib/Library.svelte'
    import Workspace from './lib/Workspace.svelte'
    import { loadTopics, restore } from './lib/store.svelte'
    import { loadSave, newId } from './lib/persist'
    import { readTemplateId, setHash } from './lib/share'
    import { templates } from './lib/templates'
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
            setHash(null)
            current = t
        } else {
            // template nativo: abre uma cópia; o original nunca muda
            fresh = true
            setHash(t.id) // a barra de endereço passa a ser o link do template
            current = { ...t, id: newId(), custom: true }
        }
    }

    // link de template nativo (#t=<id>): abre direto uma cópia dele
    const linked = readTemplateId()
    if (linked) {
        const t = templates.find((x) => x.id === linked)
        if (t) open(t)
        else { setHash(null); alert('Template do link não encontrado.') }
    }
</script>

{#if current}
    <Workspace {fresh} templateId={current.id} title={current.name} onback={() => { setHash(null); current = null }} />
{:else}
    <Library onopen={open} />
{/if}
