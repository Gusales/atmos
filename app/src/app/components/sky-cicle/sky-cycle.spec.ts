import { describe, expect, it } from 'vitest';
import { SkyCycleComponent } from './index';

function createComponent(startTime: string, endTime: string, hours: number, minutes: number): SkyCycleComponent {
    const component = new SkyCycleComponent();
    component.startTime = startTime;
    component.endTime = endTime;
    component.currentTime = new Date(2026, 0, 1, hours, minutes);
    return component as SkyCycleComponent;
}

describe('SkyCycleComponent', () => {
    describe('isNightCycle / theme', () => {
        it('is a day cycle when endTime is later than startTime', () => {
            const component = createComponent('06:00', '18:00', 12, 0) as any;
            expect(component.isNightCycle).toBe(false);
            expect(component.theme.title).toBe('Horário do sol');
        });

        it('is a night cycle when endTime is earlier than startTime (crosses midnight)', () => {
            const component = createComponent('18:00', '06:00', 22, 0) as any;
            expect(component.isNightCycle).toBe(true);
            expect(component.theme.title).toBe('Horário da lua');
        });
    });

    describe('progressPercent', () => {
        it('is 50% at the midpoint of a day cycle', () => {
            const component = createComponent('06:00', '18:00', 12, 0) as any;
            expect(component.progressPercent).toBe(50);
        });

        it('clamps to 0 before the cycle starts', () => {
            const component = createComponent('06:00', '18:00', 5, 0) as any;
            expect(component.progressPercent).toBe(0);
        });

        it('clamps to 100 after the cycle ends', () => {
            const component = createComponent('06:00', '18:00', 19, 0) as any;
            expect(component.progressPercent).toBe(100);
        });

        it('handles a night cycle crossing midnight (before midnight)', () => {
            const component = createComponent('18:00', '06:00', 22, 0) as any;
            // decorrido: 22:00-18:00=4h de 18:00 até 06:00(+1d)=12h totais -> 33.33%
            expect(component.progressPercent).toBeCloseTo(33.33, 1);
        });

        it('handles a night cycle crossing midnight (after midnight)', () => {
            const component = createComponent('18:00', '06:00', 0, 0) as any;
            // meia-noite é o meio do ciclo noturno de 18:00 a 06:00 -> 50%
            expect(component.progressPercent).toBe(50);
        });
    });

    describe('filledWidth', () => {
        it('is 0 at 0% progress', () => {
            const component = createComponent('06:00', '18:00', 5, 0) as any;
            expect(component.filledWidth).toBeCloseTo(0, 5);
        });

        it('equals the dome diameter at 100% progress', () => {
            const component = createComponent('06:00', '18:00', 19, 0) as any;
            expect(component.filledWidth).toBeCloseTo(component.domeDiameter, 5);
        });

        it('is half the dome diameter at 50% progress', () => {
            const component = createComponent('06:00', '18:00', 12, 0) as any;
            expect(component.filledWidth).toBeCloseTo(106, 5);
        });
    });

    describe('formatted times', () => {
        it('formats the current time as HH:MM', () => {
            const component = createComponent('06:00', '18:00', 9, 5) as any;
            expect(component.formattedCurrentTime).toBe('09:05');
        });

        it('truncates start/end times with seconds down to HH:MM', () => {
            const component = createComponent('05:58:10', '18:02:12', 12, 0) as any;
            expect(component.formattedStartTime).toBe('05:58');
            expect(component.formattedEndTime).toBe('18:02');
        });
    });
});
