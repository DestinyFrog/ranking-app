interface IRanking {
  topics: ITopic[];
}

interface ITopic {
  name: string;
  img: string;
  id?: number;
};
  /** dentro de uma linha de tier; rank define a ordem na linha */
  place?: { row: number; rank: number };
}

type ModuleType = "tier" | "quadrant" | "free";

interface IModule {
  id: number;
  type: ModuleType;
  name: string;
}

/** Onde um tópico está dentro de UM módulo (cada módulo tem a sua disposição). */
interface IPlacement {
  /** flutuando sobre a tela (coordenadas da viewport) */
  pos?: { x: number; y: number; z: number };
  /** dentro de uma linha de tier; rank define a ordem na linha */
  place?: { row: number; rank: number };
}
