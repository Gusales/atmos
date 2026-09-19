import { Component, Input } from "@angular/core";
import { BrazilianAqiCalculator } from "../../shared/utils/brazilian-aqi-calculator";

@Component({
    selector: 'app-air-quality',
    templateUrl: './air-quality.component.html',
    standalone: true
})
export class AirQualityComponent {
    @Input() protected readonly pm10: number = 0;
    @Input() protected readonly so2: number = 0;
    @Input() protected readonly no2: number = 0;
    @Input() protected readonly o3: number = 0;
    @Input() protected readonly co: number = 0;

    protected airQualityIndex: number;
    protected airQualityQualification: string;
    protected airQualityCriticalPollutant: string | null;
    protected airQualitySubIndices: Record<"pm10" | "so2" | "no2" | "o3" | "co", number | null>;

    constructor() {
        const airQualityBrasilianFormatResult = BrazilianAqiCalculator.calculate({
            co: this.co,
            no2: this.no2,
            o3: this.o3,
            pm10: this.pm10,
            so2: this.so2
        })

        const { index, criticalPollutant, name, subIndices } = airQualityBrasilianFormatResult

        this.airQualityIndex = index ?? 0;
        this.airQualityQualification = name;
        this.airQualityCriticalPollutant = criticalPollutant;
        this.airQualitySubIndices = subIndices;
    }

    protected get airQualityColorClass(): string {
        return this.resolveColorClass(this.airQualityQualification);
    }

    protected pollutantColorClass(pollutant: "pm10" | "so2" | "no2" | "o3" | "co"): string {
        const { name } = BrazilianAqiCalculator.classify(this.airQualitySubIndices[pollutant]);
        return this.resolveColorClass(name);
    }

    private resolveColorClass(qualification: string): string {
        if (qualification === "Boa") return "text-accent";
        if (qualification === "Moderada") return "text-warning";
        if (qualification === "Ruim") return "text-alert";
        if (qualification === "Muito ruim") return "text-danger";
        if (qualification === "Péssima") return "text-critical";

        return "text-secondary";
    }
}