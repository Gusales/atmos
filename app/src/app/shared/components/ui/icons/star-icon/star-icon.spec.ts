import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { StarIconComponent } from './index';

describe('StarIconComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StarIconComponent]
        });
    });

    it('renders with the default size and unfilled state', () => {
        const fixture = TestBed.createComponent(StarIconComponent);
        fixture.detectChanges();

        const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
        expect(svg.getAttribute('width')).toBe('16');
        expect(svg.getAttribute('height')).toBe('16');
        expect(svg.getAttribute('fill')).toBe('none');
        expect(svg.classList.contains('text-subtle')).toBe(true);
        expect(svg.classList.contains('text-sun')).toBe(false);
    });

    it('fills the star and uses the "filled" color when filled is true', () => {
        const fixture = TestBed.createComponent(StarIconComponent);
        fixture.componentRef.setInput('filled', true);
        fixture.detectChanges();

        const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
        expect(svg.getAttribute('fill')).toBe('currentColor');
        expect(svg.classList.contains('text-sun')).toBe(true);
    });

    it('uses a muted (not subtle) color when empty and mutedWhenEmpty is true', () => {
        const fixture = TestBed.createComponent(StarIconComponent);
        fixture.componentRef.setInput('mutedWhenEmpty', true);
        fixture.detectChanges();

        const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
        expect(svg.classList.contains('text-muted')).toBe(true);
        expect(svg.classList.contains('text-subtle')).toBe(false);
    });

    it('applies a custom size to width/height', () => {
        const fixture = TestBed.createComponent(StarIconComponent);
        fixture.componentRef.setInput('size', 24);
        fixture.detectChanges();

        const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
        expect(svg.getAttribute('width')).toBe('24');
        expect(svg.getAttribute('height')).toBe('24');
    });
});
