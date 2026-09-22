import { Component, Input } from "@angular/core";
import { BrazilianAqiCalculator } from "../../shared/utils/brazilian-aqi-calculator";

@Component({
    selector: 'app-air-quality',
    templateUrl: './air-quality.component.html',
    standalone: true
})
export class AirQualityComponent {
    @Input() pm10: number = 0;
    @Input() so2: number = 0;
    @Input() no2: number = 0;
    @Input() o3: number = 0;
    @Input() co: number = 0;

    private get airQualityResult() {
        return BrazilianAqiCalculator.calculate({
            co: this.co,
            no2: this.no2,
            o3: this.o3,
            pm10: this.pm10,
            so2: this.so2
        })
    }

    protected get airQualityIndex(): number {
        return this.airQualityResult.index ?? 0
    }

    protected get airQualityQualification(): string {
        return this.airQualityResult.name
    }

    protected get airQualityCriticalPollutant(): string | null {
        return this.airQualityResult.criticalPollutant
    }

    protected get airQualitySubIndices(): Record<"pm10" | "so2" | "no2" | "o3" | "co", number | null> {
        return this.airQualityResult.subIndices
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
