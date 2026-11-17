<script lang="ts">
    import UlTopic from "./UlTopic.svelte"

    let topics: ITopic[] = $state([
        {
            img: 'https://cdn.myanimelist.net/r/200x268/images/characters/5/203429.jpg?s=5e33d396ad8cbc5542e82c3270a537f1',
            name: 'Kaito',
        },
        {
            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxGRR2btPdibU91kLR9LSMQHHysCqVbMOsQ-QzYeZz6A&s=10',
            name: 'Gon',
        },
        {
            img: 'https://ovicio.com.br/wp-content/uploads/2022/03/20220323-killua-zoldyck-555x555.webp',
            name: 'Killua',
        },
        {
            img: 'https://sm.ign.com/ign_br/screenshot/default/gotham-knights-1_ers7.png',
            name: 'Kurapika',
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/7/73/HxH2011_EP145_Leorio_Portrait.png/revision/latest?cb=20230902193715',
            name: 'Leorio',
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/a/aa/HxH2011_EP3_Hanzo_Portrait.png/revision/latest?cb=20221007164354',
            name: 'Hanzo'
        },
        {
            img : 'https://static.wikia.nocookie.net/hunterxhunter/images/2/29/Hisoka_Morow_YC_Portrait.png/revision/latest?cb=20190123172039',
            name: 'Hisoka'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/4/4c/Machi_Komacine_HA_Portrait.png/revision/latest?cb=20131116122706',
            name: 'Machi Komazine'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/9/9e/HxH2011_EP53_Shizuku_Portrait.png/revision/latest?cb=20230122061315',
            name: 'Shizuku Murasaki'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/d/da/Pakunoda_YC_Portrait.png/revision/latest?cb=20190124184929',
            name: 'Pakunoda'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/7/78/Chrollo_Lucilfer_GI_Portrait.png/revision/latest?cb=20130502190618',
            name: 'Chrollo Lucifer'
        },
        {
            img: 'https://static.wikia.nocookie.net/hunterxhunter/images/4/46/HxH2011_EP50_Nobunaga_Portrait.png/revision/latest?cb=20230122183803',
            name: 'Nobunaga'
        },
    ])
</script>

<aside id="left-bar">
    <button id="add-topic-button">+</button>
    <UlTopic {topics}></UlTopic>
</aside>

<style>
#left-bar {
    --padding: calc(var(--gap) * 2);
    box-sizing: border-box;
    flex-shrink: 0;
    width: calc(var(--cell-size) + var(--padding) * 2);
    height: 100%;
    padding: var(--padding);
    background-color: var(--color-surface);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--color-accent) transparent;
}

#left-bar::-webkit-scrollbar { width: 4px; }
#left-bar::-webkit-scrollbar-track { background: transparent; }
#left-bar::-webkit-scrollbar-thumb {
    background: var(--color-accent);
    border-radius: 999px;
}
#left-bar::-webkit-scrollbar-thumb:hover { background: var(--color-text); }

button {
    background-color: var(--color-surface-dark);
    border: 0;
    border-bottom: var(--border-width) solid var(--color-accent);
    border-radius: var(--radius) var(--radius) 0 0;
    color: var(--color-text);
    font-size: 16px;
    cursor: pointer;
}

#add-topic-button {
    width: 100%;
    margin-bottom: var(--gap);
}

</style>