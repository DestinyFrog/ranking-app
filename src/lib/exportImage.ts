import { board, getPlacement, getRows } from './store.svelte'

const CELL = 120          // largura de cada tópico (px)
const GAP = 8
const LABEL_W = 140
const WIDTH = 1280
const BG = '#1b1b24'
const ACCENT = '#555'
const TOPIC_BG = '#c9c3d6'

function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' // sem isso o canvas fica "tainted" e não exporta
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
    })
}

/** Equivale a object-fit:cover + object-position + transform:scale do <img> do tópico. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, t: ITopic) {
    const ox = (t.ox ?? 50) / 100, oy = (t.oy ?? 0) / 100, zoom = t.zoom ?? 1
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    ctx.translate(x + w * ox, y + h * oy) // origem da escala
    ctx.scale(zoom, zoom)
    ctx.translate(-w * ox, -h * oy)
    ctx.drawImage(img, (w - dw) * ox, (h - dh) * oy, dw, dh)
    ctx.restore()
}

function drawTopic(ctx: CanvasRenderingContext2D, t: ITopic, img: HTMLImageElement | null, x: number, y: number, size: number, display: string) {
    const sphere = display === 'sphere'
    const showName = !sphere && display !== 'image'
    const showImg = sphere || display !== 'name'
    const headH = showName ? 24 : 0
    const imgH = sphere ? size : showImg ? Math.round(size * 4 / 3) : 0

    ctx.save()
    if (sphere) {
        ctx.beginPath()
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
        ctx.clip()
    }
    if (showName) {
        ctx.fillStyle = '#12121a'
        ctx.fillRect(x, y, size, headH)
        ctx.fillStyle = '#eee'
        ctx.font = '13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(t.name, x + size / 2, y + headH / 2, size - 6)
    }
    if (showImg) {
        ctx.fillStyle = TOPIC_BG
        ctx.fillRect(x, y + headH, size, imgH)
        if (img) drawCover(ctx, img, x, y + headH, size, imgH, t)
    }
    ctx.restore()
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 2
    if (sphere) {
        ctx.beginPath()
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
        ctx.stroke()
    } else {
        ctx.strokeRect(x, y, size, headH + imgH)
    }
    return headH + imgH
}

/** Gera um PNG da tierlist do módulo (linhas e tópicos posicionados) e baixa o arquivo. */
export async function exportTierImage(moduleId: number, title: string, moduleName: string) {
    const rows = getRows(moduleId)
    const display = board.display
    const perRow = rows.map((r) =>
        board.topics
            .filter((t) => getPlacement(moduleId, t.id)?.place?.row === r.id)
            .sort((a, b) => getPlacement(moduleId, a.id)!.place!.rank - getPlacement(moduleId, b.id)!.place!.rank),
    )

    const imgs = new Map<string, HTMLImageElement | null>()
    const urls = [...new Set(perRow.flat().map((t) => t.img))]
    await Promise.all(urls.map(async (u) => imgs.set(u, await loadImage(u))))

    const topicH = (display === 'sphere' ? CELL : display === 'name' ? 0 : Math.round(CELL * 4 / 3)) +
        (display === 'sphere' || display === 'image' ? 0 : 24)
    const areaW = WIDTH - LABEL_W - GAP * 2
    const perLine = Math.max(1, Math.floor((areaW + GAP) / (CELL + GAP)))
    const rowHeights = perRow.map((list) =>
        Math.max(1, Math.ceil(list.length / perLine)) * (topicH + GAP) + GAP,
    )
    const rowH = (i: number) => Math.max(rowHeights[i], CELL * 0.8)

    const titleH = 56
    const height = titleH + rows.reduce((s, _, i) => s + rowH(i) + GAP, 0) + GAP
    const scale = 2 // nitidez
    const canvas = document.createElement('canvas')
    canvas.width = WIDTH * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    ctx.fillStyle = BG
    ctx.fillRect(0, 0, WIDTH, height)
    ctx.fillStyle = '#fff'
    ctx.font = '700 26px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${title} — ${moduleName}`, GAP * 2, titleH / 2)

    let y = titleH
    rows.forEach((row, i) => {
        const h = rowH(i)
        ctx.fillStyle = '#12121a'
        ctx.fillRect(GAP, y, WIDTH - GAP * 2, h)
        ctx.fillStyle = row.color
        ctx.fillRect(GAP, y, LABEL_W, h)
        ctx.fillStyle = '#111'
        ctx.font = '700 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(row.label, GAP + LABEL_W / 2, y + h / 2, LABEL_W - 12)
        ctx.strokeStyle = ACCENT
        ctx.lineWidth = 2
        ctx.strokeRect(GAP, y, WIDTH - GAP * 2, h)

        perRow[i].forEach((t, k) => {
            const cx = GAP + LABEL_W + GAP + (k % perLine) * (CELL + GAP)
            const cy = y + GAP + Math.floor(k / perLine) * (topicH + GAP)
            drawTopic(ctx, t, imgs.get(t.img) ?? null, cx, cy, CELL, display)
        })
        y += h + GAP
    })

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
    if (!blob) throw new Error('Não foi possível gerar a imagem.')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${title}-${moduleName}.png`.replace(/[\\/:*?"<>|]+/g, '_')
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    return urls.filter((u) => !imgs.get(u)).length // imagens que não carregaram
}
