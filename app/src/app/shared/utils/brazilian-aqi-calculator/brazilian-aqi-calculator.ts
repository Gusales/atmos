/** Poluentes suportados pelo cálculo do IQAr. */
type Pollutant = "pm10" | "so2" | "no2" | "o3" | "co";

/** Uma faixa de interpolação: concentração (cLow/cHigh) -> índice (iLow/iHigh). */
interface BreakpointRange {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

/** Uma faixa de classificação do índice final. */
interface Category {
  max: number;
  name: string;
}

/** Leituras de poluentes recebidas da API de clima (co em µg/m³). */
interface PollutantReadings {
  pm10?: number | null;
  so2?: number | null;
  no2?: number | null;
  o3?: number | null;
  co?: number | null;
}

/** Sub-índices calculados individualmente por poluente. */
type SubIndices = Record<Pollutant, number | null>;

/** Classificação (nome + cor) de um índice. */
interface Classification {
  name: string;
}

/** Resultado final do cálculo do IQAr. */
interface BrazilianAqiResult extends Classification {
  index: number | null;
  criticalPollutant: Pollutant | null;
  subIndices: SubIndices;
}

export class BrazilianAqiCalculator {
  private static readonly BREAKPOINTS: Record<Pollutant, BreakpointRange[]> = {
    pm10: [
      { cLow: 0, cHigh: 45, iLow: 0, iHigh: 50 },
      { cLow: 45, cHigh: 100, iLow: 50, iHigh: 100 },
      { cLow: 100, cHigh: 150, iLow: 100, iHigh: 150 },
      { cLow: 150, cHigh: 250, iLow: 150, iHigh: 200 },
      { cLow: 250, cHigh: 600, iLow: 200, iHigh: 300 },
    ],
    so2: [
      { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
      { cLow: 40, cHigh: 50, iLow: 50, iHigh: 100 },
      { cLow: 50, cHigh: 125, iLow: 100, iHigh: 150 },
      { cLow: 125, cHigh: 800, iLow: 150, iHigh: 200 },
      { cLow: 800, cHigh: 2000, iLow: 200, iHigh: 300 },
    ],
    no2: [
      { cLow: 0, cHigh: 200, iLow: 0, iHigh: 50 },
      { cLow: 200, cHigh: 240, iLow: 50, iHigh: 100 },
      { cLow: 240, cHigh: 320, iLow: 100, iHigh: 150 },
      { cLow: 320, cHigh: 1130, iLow: 150, iHigh: 200 },
      { cLow: 1130, cHigh: 2260, iLow: 200, iHigh: 300 },
    ],
    o3: [
      { cLow: 0, cHigh: 100, iLow: 0, iHigh: 50 },
      { cLow: 100, cHigh: 130, iLow: 50, iHigh: 100 },
      { cLow: 130, cHigh: 160, iLow: 100, iHigh: 150 },
      { cLow: 160, cHigh: 200, iLow: 150, iHigh: 200 },
      { cLow: 200, cHigh: 400, iLow: 200, iHigh: 300 },
    ],
    co: [
      // concentração em ppm
      { cLow: 0, cHigh: 9, iLow: 0, iHigh: 50 },
      { cLow: 9, cHigh: 11, iLow: 50, iHigh: 100 },
      { cLow: 11, cHigh: 13, iLow: 100, iHigh: 150 },
      { cLow: 13, cHigh: 15, iLow: 150, iHigh: 200 },
      { cLow: 15, cHigh: 30, iLow: 200, iHigh: 300 },
    ],
  };

  private static readonly CATEGORIES: Category[] = [
    { max: 50, name: "Boa" },
    { max: 100, name: "Moderada" },
    { max: 150, name: "Ruim" },
    { max: 200, name: "Muito ruim" },
    { max: Infinity, name: "Péssima" },
  ];

  // 1 ppm de CO equivale a aproximadamente 1145 µg/m³ a 25°C.
  private static readonly CO_UGM3_PER_PPM = 1145;

  static convertCoToPpm(microgramsPerCubicMeter: number | null | undefined): number | null {
    if (microgramsPerCubicMeter == null) return null;
    return microgramsPerCubicMeter / this.CO_UGM3_PER_PPM;
  }

  static calculateSubIndex(
    pollutant: Pollutant,
    concentration: number | null | undefined
  ): number | null {
    if (concentration == null) return null;

    const ranges = this.BREAKPOINTS[pollutant];

    const range =
      ranges.find((r) => concentration >= r.cLow && concentration <= r.cHigh) ??
      ranges[ranges.length - 1];

    const { cLow, cHigh, iLow, iHigh } = range;
    const subIndex = iLow + ((iHigh - iLow) / (cHigh - cLow)) * (concentration - cLow);

    return Math.round(subIndex);
  }

  static classify(indexValue: number | null): Classification {
    if (indexValue == null) return { name: "Indisponível" };
    const category = this.CATEGORIES.find((c) => indexValue <= c.max)!;
    return { name: category.name };
  }

  static calculate({ pm10, so2, no2, o3, co }: PollutantReadings): BrazilianAqiResult {
    const subIndices: SubIndices = {
      pm10: this.calculateSubIndex("pm10", pm10),
      so2: this.calculateSubIndex("so2", so2),
      no2: this.calculateSubIndex("no2", no2),
      o3: this.calculateSubIndex("o3", o3),
      co: this.calculateSubIndex("co", this.convertCoToPpm(co)),
    };

    const entries = Object.entries(subIndices) as [Pollutant, number | null][];
    const validEntries = entries.filter(([, value]) => value != null) as [Pollutant, number][];

    const index = validEntries.length
      ? Math.max(...validEntries.map(([, value]) => value))
      : null;

    const criticalPollutant =
      validEntries.find(([, value]) => value === index)?.[0] ?? null;

    return { index, criticalPollutant, subIndices, ...this.classify(index) };
  }
}

/* ------------------------------------------------------------------ */
/* Exemplo de uso                                                      */
/* ------------------------------------------------------------------ */
//
// const result = BrazilianAqiCalculator.calculate({
//   pm10: 26.0,
//   so2: 10.0,
//   no2: 25.0,
//   o3: 95.0,
//   co: 304.0,
// });
//
// console.log(result);
// { index: 48, criticalPollutant: "o3", subIndices: {...}, name: "Boa", color: "#4caf50" }

