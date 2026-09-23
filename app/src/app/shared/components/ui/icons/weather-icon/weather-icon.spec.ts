import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WeatherNamesEnum } from '../../../../enums';
import { WeatherIconComponent } from './index';

describe('WeatherIconComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [WeatherIconComponent]
        });
    });

    function render(name: WeatherNamesEnum) {
        const fixture = TestBed.createComponent(WeatherIconComponent);
        fixture.componentRef.setInput('name', name);
        fixture.detectChanges();
        return fixture.nativeElement.querySelector('img') as HTMLImageElement;
    }

    it.each([
        [WeatherNamesEnum.SUN, 'sun'],
        [WeatherNamesEnum.CLOUDY, 'clouds'],
        [WeatherNamesEnum.PARTLY_CLOUDY, 'clouds-sun'],
        [WeatherNamesEnum.RAIN, 'clouds-sun'],
        [WeatherNamesEnum.THUNDER, 'clouds-thunder']
    ])('resolves %s to the "%s" icon path', (weather, iconName) => {
        const img = render(weather);
        expect(img.getAttribute('src')).toBe(`/assets/svg/${iconName}.svg`);
    });

    it('sets an alt text describing the icon', () => {
        const img = render(WeatherNamesEnum.THUNDER);
        expect(img.getAttribute('alt')).toBe('Ícone de tempo tempestuoso');
    });

    it('forwards the "class" input onto the img element', () => {
        const fixture = TestBed.createComponent(WeatherIconComponent);
        fixture.componentRef.setInput('name', WeatherNamesEnum.SUN);
        fixture.componentRef.setInput('class', 'h-8 w-8');
        fixture.detectChanges();

        const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
        expect(img.className).toBe('h-8 w-8');
    });
});
