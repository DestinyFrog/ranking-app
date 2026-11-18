<script lang="ts">
    import { onDestroy } from 'svelte'
    import Topic from './Topic.svelte'
    import { board, newRowId, getPlacement, releaseRow } from './store.svelte'

    let { moduleId }: { moduleId: number } = $props()

    interface Row {
        id: number
        label: string
        color: string
    }

    const rows: Row[] = $state([
        { id: newRowId(), label: 'S', color: '#ff7f7f' },
        { id: newRowId(), label: 'A', color: '#ffbf7f' },
        { id: newRowId(), label: 'B', color: '#ffdf7f' },
        { id: newRowId(), label: 'C', color: '#ffff7f' },
        { id: newRowId(), label: 'D', color: '#bfff7f' },
    ])

    const rankOf = (id?: number) => getPlacement(moduleId, id)?.place
    const topicsIn = (rowId: number) =>
        board.topics
            .filter((t) => rankOf(t.id)?.row === rowId)
            .sort((a, b) => rankOf(a.id)!.rank - rankOf(b.id)!.rank)

    // tópicos de uma linha que deixa de existir voltam para a barra
    const release = (rowId: number) => releaseRow(moduleId, rowId)
    onDestroy(() => rows.forEach((r) => release(r.id)))

    function addRow() {
        rows.push({ id: newRowId(), label: 'Novo', color: '#7fbfff' })
    }

    function removeRow(id: number) {
        release(id)
        rows.splice(rows.findIndex((r) => r.id === id), 1)
    }

    function move(index: number, dir: -1 | 1) {
        const j = index + dir
        if (j < 0 || j >= rows.length) return
        ;[rows[index], rows[j]] = [rows[j], rows[index]]
    }
</script>

<div class="tier">
    {#each rows as row, i (row.id)}
        <div class="row">
            <div class="label" style:background-color={row.color}>
                <input bind:value={row.label} aria-label="Nome da linha" maxlength="24" />
                <div class="tools">
                    <input type="color" bind:value={row.color} aria-label="Cor" />
                    <button onclick={() => move(i, -1)} aria-label="Subir" disabled={i === 0}>↑</button>
                    <button onclick={() => move(i, 1)} aria-label="Descer" disabled={i === rows.length - 1}>↓</button>
                    <button onclick={() => removeRow(row.id)} aria-label="Remover">×</button>
                </div>
            </div>
            <ul class="area" data-row-id={row.id}>
                {#each topicsIn(row.id) as t (t.id)}
                    <Topic topic={t} {moduleId} />
                {/each}
            </ul>
        </div>
    {/each}
    <button class="add" onclick={addRow}>+ Adicionar linha</button>
</div>

<style>
.tier {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    height: 100%;
    padding: var(--gap);
    overflow-y: auto;
}

.row {
    display: flex;
    flex: 1 0 auto;
    min-height: calc(var(--cell-size) + 60px);
    border: var(--border-width) solid var(--color-accent);
    background-color: var(--color-surface-dark);
}

.label {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    width: 110px;
    padding: 4px;
    color: #111;
}

.label > input {
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    font: 700 20px sans-serif;
    text-align: center;
}
.label > input:focus {
    outline: 1px dashed #111;
}

.tools {
    display: flex;
    gap: 2px;
    opacity: 0.35;
    transition: opacity 0.15s;
}
.label:hover .tools,
.label:focus-within .tools {
    opacity: 1;
}
.tools button {
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    background: rgb(0 0 0 / 0.2);
    color: #111;
    cursor: pointer;
}
.tools button:disabled { opacity: 0.3; cursor: default; }
.tools input[type='color'] {
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
}

.area {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: var(--gap);
    padding: var(--gap);
    list-style: none;
}
.area :global(.topic) {
    margin-bottom: 0;
}

.add {
    flex-shrink: 0;
    padding: 8px;
    border: var(--border-width) dashed var(--color-accent);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
}
</style>
