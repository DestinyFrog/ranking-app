import requests
import json
import time

ANILIST_URL = "https://graphql.anilist.co"

def buscar_anime_por_id(anime_id=11061):
    """Busca o anime pelo ID fixo da AniList (2011 = 11061)."""
    query = """
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
      }
    }
    """
    variables = {"id": anime_id}
    
    for tentativa in range(1, 4):
        try:
            resp = requests.post(ANILIST_URL, json={"query": query, "variables": variables}, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            media = data.get("data", {}).get("Media")
            if media:
                return media["id"], media["title"].get("english") or media["title"].get("romaji")
            return None, None
        except Exception as e:
            print(f"  Tentativa {tentativa} falhou: {e}")
            if tentativa < 3:
                time.sleep(3)
    return None, None


def buscar_personagens(anime_id):
    """Busca todos os personagens do anime pelo ID, com paginação."""
    query = """
    query ($mediaId: Int, $page: Int, $perPage: Int) {
      Media(id: $mediaId, type: ANIME) {
        characters(page: $page, perPage: $perPage, sort: [ROLE, RELEVANCE, ID]) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
            }
          }
        }
      }
    }
    """
    
    todos = []
    page = 1
    per_page = 50  # máximo permitido pela AniList
    
    while True:
        variables = {"mediaId": anime_id, "page": page, "perPage": per_page}
        
        for tentativa in range(1, 4):
            try:
                resp = requests.post(ANILIST_URL, json={"query": query, "variables": variables}, timeout=20)
                resp.raise_for_status()
                data = resp.json()
                
                media = data.get("data", {}).get("Media")
                if not media or not media.get("characters"):
                    return todos
                
                chars_data = media["characters"]
                edges = chars_data.get("edges", [])
                
                for edge in edges:
                    node = edge.get("node", {})
                    nome = node.get("name", {}).get("full", "")
                    # Prefere a imagem large, fallback para medium
                    img = ""
                    image_obj = node.get("image", {})
                    if image_obj:
                        img = image_obj.get("large") or image_obj.get("medium") or ""
                    
                    if nome:
                        todos.append({"name": nome, "img": img})
                
                # Verifica se há próxima página
                if not chars_data.get("pageInfo", {}).get("hasNextPage", False):
                    return todos
                
                page += 1
                # Respeitar rate limit: 30 req/min => ~2s entre requisições
                time.sleep(2)
                break  # sai do retry, continua o while
                
            except Exception as e:
                print(f"  Tentativa {tentativa} falhou na página {page}: {e}")
                if tentativa < 3:
                    time.sleep(5)
                else:
                    print(f"  Desistindo da página {page}.")
                    return todos
    
    return todos


def main():
    print("Buscando anime na AniList...")
    anime_id, anime_nome = buscar_anime_por_id(2001)
    
    if not anime_id:
        print("Anime não encontrado na AniList.")
        return
    
    print(f"Anime encontrado: {anime_nome} (ID: {anime_id})")
    print("Buscando personagens (isso pode levar alguns minutos devido ao rate limit)...")
    
    personagens = buscar_personagens(anime_id)
    
    if not personagens:
        print("Nenhum personagem encontrado.")
        return
    
    resultado = {
        "id": "gurren-lagann-characters",
        "name": "Gurren Lagann — Personagens",
        "description": "Personagens de Gurren Lagann obtidos via API AniList",
        "topics": personagens
    }
    
    with open("gurren-lagann-characters.json", "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"\nJSON salvo com sucesso! Total de {len(personagens)} personagens.")


if __name__ == "__main__":
    main()