import requests
import json
import time

BASE_URL = "https://last-airbender-api.fly.dev/api/v1"

def buscar_todos_personagens():
    """Busca todos os personagens com paginação."""
    todos = []
    page = 1
    per_page = 50  # A API aceita perPage; 50 é um bom tamanho de lote

    while True:
        url = f"{BASE_URL}/characters?page={page}&perPage={per_page}"
        print(f"Buscando página {page}...")

        for tentativa in range(1, 4):
            try:
                resp = requests.get(url, timeout=20)
                resp.raise_for_status()
                dados = resp.json()

                # A API pode retornar uma lista diretamente ou um objeto com 'data'
                if isinstance(dados, list):
                    personagens_pagina = dados
                else:
                    personagens_pagina = dados.get("data", [])

                if not personagens_pagina:
                    print("Nenhum personagem retornado. Finalizando.")
                    return todos

                for p in personagens_pagina:
                    nome = p.get("name", "")
                    # O campo de imagem é 'photoUrl'
                    img = p.get("photoUrl", "")
                    if nome:
                        todos.append({"name": nome, "img": img})

                print(f"  {len(personagens_pagina)} personagens processados (total: {len(todos)}).")

                # Se retornou menos que o per_page, provavelmente é a última página
                if len(personagens_pagina) < per_page:
                    return todos

                page += 1
                time.sleep(1)  # Pausa educada entre requisições
                break

            except Exception as e:
                print(f"  Tentativa {tentativa} falhou na página {page}: {e}")
                if tentativa < 3:
                    time.sleep(3)
                else:
                    print(f"  Desistindo da página {page}.")
                    return todos

    return todos

def main():
    print("Buscando personagens de Avatar na Last Airbender API...")
    personagens = buscar_todos_personagens()

    if not personagens:
        print("Nenhum personagem encontrado.")
        return

    resultado = {
        "id": "avatar-characters",
        "name": "Avatar: A Lenda de Aang — Personagens",
        "description": "Personagens de Avatar: A Lenda de Aang e A Lenda de Korra obtidos via Last Airbender API",
        "topics": personagens
    }

    with open("avatar_personagens.json", "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(f"\nJSON salvo com sucesso! Total de {len(personagens)} personagens.")

if __name__ == "__main__":
    main()