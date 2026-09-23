import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Place } from '../../shared/types';
import { PlaceMock } from '../../shared/types';
import { PlaceSearchComponent } from './index';

describe('PlaceSearchComponent', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<PlaceSearchComponent>>;
    let component: PlaceSearchComponent;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [PlaceSearchComponent] });
        fixture = TestBed.createComponent(PlaceSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        TestBed.tick();
        vi.advanceTimersByTime(400);
        TestBed.tick();
        fixture.detectChanges();
    });

    afterEach(() => vi.useRealTimers());

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    function typeQuery(value: string): void {
        const el = input();
        el.value = value;
        el.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        TestBed.tick();
        fixture.detectChanges();
    }

    function settleDebounce(): void {
        vi.advanceTimersByTime(400);
        TestBed.tick();
        fixture.detectChanges();
    }

    function twoPlaces(): Place[] {
        return [
            new PlaceMock().entity({ id: '1', name: 'Barueri' }),
            new PlaceMock().entity({ id: '2', name: 'Osasco' })
        ];
    }

    it('opens the dropdown on focus', () => {
        input().dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(input().getAttribute('aria-expanded')).toBe('true');
    });

    it('shows the loading state while typing (debouncing)', () => {
        typeQuery('Bar');

        const listItem = fixture.nativeElement.querySelector('li');
        expect(listItem.textContent).toContain('Procurando cidade');
    });

    describe('debounced search output', () => {
        it('does not emit search immediately while typing', () => {
            const emitted: string[] = [];
            component.search.subscribe(value => emitted.push(value));

            typeQuery('Barueri');

            expect(emitted).toEqual([]);
        });

        it('emits the trimmed search term 400ms after the user stops typing', () => {
            const emitted: string[] = [];
            component.search.subscribe(value => emitted.push(value));

            typeQuery('  Barueri  ');
            settleDebounce();

            expect(emitted).toEqual(['Barueri']);
        });

        it('does not emit for an empty/whitespace-only query', () => {
            const emitted: string[] = [];
            component.search.subscribe(value => emitted.push(value));

            typeQuery('   ');
            settleDebounce();

            expect(emitted).toEqual([]);
        });

        it('stops showing the loading state once the debounce settles', () => {
            typeQuery('Barueri');
            settleDebounce();
            fixture.detectChanges();

            const listItem = fixture.nativeElement.querySelector('li');
            expect(listItem?.textContent).not.toContain('Procurando cidade');
        });
    });

    describe('rendering places', () => {
        it('shows an empty state when there are no places and it is not loading', () => {
            fixture.componentRef.setInput('places', []);
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent).toContain('Nenhum lugar encontrado');
        });

        it('renders one option per place', () => {
            fixture.componentRef.setInput('places', twoPlaces());
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            const options = fixture.nativeElement.querySelectorAll('li[role="option"]');
            expect(options.length).toBe(2);
        });

        it('shows the loading state instead of the list when [loading] is true', () => {
            fixture.componentRef.setInput('places', twoPlaces());
            fixture.componentRef.setInput('loading', true);
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent).toContain('Procurando cidade');
            expect(fixture.nativeElement.querySelectorAll('li[role="option"]').length).toBe(0);
        });
    });

    describe('keyboard navigation', () => {
        it('moves the active option down with ArrowDown', () => {
            fixture.componentRef.setInput('places', twoPlaces());
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            fixture.detectChanges();

            const options = fixture.nativeElement.querySelectorAll('li[role="option"]');
            expect(options[0].getAttribute('aria-selected')).toBe('true');
        });

        it('selects the active option and emits placeSelected on Enter', () => {
            const places = twoPlaces();
            fixture.componentRef.setInput('places', places);
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            let selected: unknown;
            component.placeSelected.subscribe(place => (selected = place));

            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            fixture.detectChanges();

            expect(selected).toEqual(places[0]);
            expect(input().value).toBe(places[0].name);
            expect(input().getAttribute('aria-expanded')).toBe('false');
        });

        it('closes the dropdown on Escape', () => {
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input().getAttribute('aria-expanded')).toBe('true');

            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            fixture.detectChanges();

            expect(input().getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('selecting by click', () => {
        it('emits placeSelected and closes when an option is clicked', () => {
            const places = [new PlaceMock().entity()];
            fixture.componentRef.setInput('places', places);
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            let selected: unknown;
            component.placeSelected.subscribe(place => (selected = place));

            fixture.nativeElement.querySelector('li[role="option"]').click();
            fixture.detectChanges();

            expect(selected).toEqual(places[0]);
        });
    });

    describe('closing on outside click', () => {
        it('closes when clicking outside the component', () => {
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input().getAttribute('aria-expanded')).toBe('true');

            document.body.click();
            fixture.detectChanges();

            expect(input().getAttribute('aria-expanded')).toBe('false');
        });

        it('does not close when clicking inside the component', () => {
            input().dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input().click();
            fixture.detectChanges();

            expect(input().getAttribute('aria-expanded')).toBe('true');
        });
    });
});
