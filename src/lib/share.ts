// Link para um template nativo: carrega só o id (#t=<id>), então é curto e sempre
// abre a versão atual do template. Rankings do usuário não têm link (vivem no navegador dele).
const PREFIX = '#t='

export const templateUrl = (id: string) => `${location.origin}${location.pathname}${PREFIX}${encodeURIComponent(id)}`

/** id do template no fragmento da URL; null se não houver. */
export const readTemplateId = (hash = location.hash) =>
    hash.startsWith(PREFIX) ? decodeURIComponent(hash.slice(PREFIX.length)) : null

/** Atualiza o link na barra de endereço sem recarregar nem criar entrada no histórico. */
export const setHash = (id: string | null) =>
    history.replaceState(null, '', location.pathname + location.search + (id ? PREFIX + encodeURIComponent(id) : ''))
