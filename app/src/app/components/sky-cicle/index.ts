import { Component, Input } from "@angular/core";

interface SkyTheme {
  title: string;
  iconSrc: string;
  indicatorColorClass: string;
  glowColor: string; // "R, G, B", ex: "251, 219, 96"
  chart: string;
}

const DAY_THEME: SkyTheme = {
  title: "Horário do sol",
  iconSrc: "/assets/svg/time.svg",
  indicatorColorClass: "before:bg-warning",
  glowColor: "251, 219, 96",
  chart: "/assets/svg/day-chart.svg"
};

const NIGHT_THEME: SkyTheme = {
  title: "Horário da lua",
  iconSrc: "/assets/svg/time.svg",
  indicatorColorClass: "before:bg-moon",
  glowColor: "203, 213, 225",
  chart: "/assets/svg/night-chart.svg"
};

/** Raio do arco em px — o mesmo valor usado no translate do indicador. */
const DOME_RADIUS = 106;

@Component({
  selector: 'app-sky-cycle',
  templateUrl: './sky-cycle.component.html',
  standalone: true
})
export class SkyCycleComponent {
  @Input() startTime: string = "18:00";
  @Input() endTime: string = "06:00";
  @Input() currentTime: Date = new Date();

  protected readonly domeDiameter = DOME_RADIUS * 2;

  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Heurística: se o horário final é "menor" que o inicial, o ciclo atravessa
   * a meia-noite — típico do ciclo da lua. Não é 100% preciso (a lua nem sempre
   * cruza a meia-noite), mas cobre o caso comum sem exigir um input extra.
   */
  protected get isNightCycle(): boolean {
    const startMinutes = this.parseTimeToMinutes(this.startTime);
    const endMinutes = this.parseTimeToMinutes(this.endTime);
    return endMinutes < startMinutes;
  }

  protected get theme(): SkyTheme {
    return this.isNightCycle ? NIGHT_THEME : DAY_THEME;
  }

  protected get progressPercent(): number {
    const startMinutes = this.parseTimeToMinutes(this.startTime);
    let endMinutes = this.parseTimeToMinutes(this.endTime);
    let currentMinutes = this.currentTime.getHours() * 60 + this.currentTime.getMinutes();

    if (this.isNightCycle) {
      endMinutes += 24 * 60;
      if (currentMinutes < startMinutes) {
        currentMinutes += 24 * 60;
      }
    }

    if (currentMinutes <= startMinutes) return 0;
    if (currentMinutes >= endMinutes) return 100;

    const totalMinutes = endMinutes - startMinutes;
    const elapsedMinutes = currentMinutes - startMinutes;

    return (elapsedMinutes / totalMinutes) * 100;
  }

  /**
   * Largura visível da área preenchida, do nascer até a posição atual.
   * Acompanha a coordenada horizontal do indicador, então a borda direita
   * do preenchimento fica sempre alinhada com ele.
   */
  protected get filledWidth(): number {
    const angle = (this.progressPercent / 100) * Math.PI;
    return DOME_RADIUS * (1 - Math.cos(angle));
  }

  protected get formattedCurrentTime(): string {
    const hours = this.currentTime.getHours().toString().padStart(2, "0");
    const minutes = this.currentTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  protected get formattedStartTime(): string {
    return this.startTime.slice(0, 5);
  }

  protected get formattedEndTime(): string {
    return this.endTime.slice(0, 5);
  }
}