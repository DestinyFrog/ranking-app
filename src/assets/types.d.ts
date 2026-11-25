interface IRanking {
  topics: ITopic[];
}

interface ITopic {
  name: string;
  img: string;
  id?: number;
  zoom?: number; // 1 = sem zoom
  ox?: number; // enquadramento da imagem, 0–100 (%), padrão 50
  oy?: number; // padrão 0 (topo, onde ficam os rostos)
};

type ModuleType = "tier" | "quadrant" | "free";

interface IModule {
  id: number;
  type: ModuleType;
  name: string;
}

/** Onde um tópico está dentro de UM módulo (cada módulo tem a sua disposição). */
interface IPlacement {
  /**
   * flutuando sobre o módulo. fx/fy são frações (0..1) do quadro do módulo (o plano do quadrante,
   * ou a área do módulo), então acompanham qualquer tamanho de tela. x/y (px da viewport) é o
   * formato antigo, ainda lido de salvamentos antigos.
   */
  pos?: { z: number; fx?: number; fy?: number; x?: number; y?: number };
  /** dentro de uma linha de tier; rank define a ordem na linha */
  place?: { row: number; rank: number };
}

/** Como os tópicos são exibidos. */
type TopicDisplay = "both" | "name" | "image" | "sphere";
