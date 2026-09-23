import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FavoritePlaceMock } from '../../core/services/favorites';
import { FavoritesModalComponent } from './index';

describe('FavoritesModalComponent', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<FavoritesModalComponent>>;
    let component: FavoritesModalComponent;
    const originalOverflow = document.body.style.overflow;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [FavoritesModalComponent] });
        fixture = TestBed.createComponent(FavoritesModalComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        document.body.style.overflow = originalOverflow;
    });

    it('renders nothing when open is false', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    });

    it('renders the dialog and one option per favorite when open', () => {
        const favorites = [
            new FavoritePlaceMock().entity({ id: '1', name: 'Barueri' }),
            new FavoritePlaceMock().entity({ id: '2', name: 'Osasco' })
        ];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
        const options = fixture.nativeElement.querySelectorAll('li[role="option"]');
        expect(options.length).toBe(2);
    });

    it('shows an empty state when there are no favorites', () => {
        fixture.componentRef.setInput('favorites', []);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        expect(fixture.nativeElement.textContent).toContain('Nenhum lugar favoritado ainda');
    });

    it('marks the current favorite as selected', () => {
        const favorites = [
            new FavoritePlaceMock().entity({ id: '1', name: 'Barueri' }),
            new FavoritePlaceMock().entity({ id: '2', name: 'Osasco' })
        ];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('currentPlaceId', '2');
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        const options = fixture.nativeElement.querySelectorAll('li[role="option"]');
        expect(options[0].getAttribute('aria-selected')).toBe('false');
        expect(options[1].getAttribute('aria-selected')).toBe('true');
    });

    it('emits placeSelected and closed when a non-current favorite is clicked', () => {
        const favorites = [new FavoritePlaceMock().entity({ id: '1' })];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('currentPlaceId', null);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        let selected: unknown;
        let closed = false;
        component.placeSelected.subscribe(place => (selected = place));
        component.closed.subscribe(() => (closed = true));

        fixture.nativeElement.querySelector('li[role="option"]').click();

        expect(selected).toEqual(favorites[0]);
        expect(closed).toBe(true);
    });

    it('does not emit placeSelected when clicking the already-current favorite', () => {
        const favorites = [new FavoritePlaceMock().entity({ id: '1' })];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('currentPlaceId', '1');
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        let selected: unknown;
        component.placeSelected.subscribe(place => (selected = place));

        fixture.nativeElement.querySelector('li[role="option"]').click();

        expect(selected).toBeUndefined();
    });

    it('emits placeRemoved without selecting when the remove button is clicked', () => {
        const favorites = [new FavoritePlaceMock().entity({ id: '1' })];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        let removedId: string | undefined;
        let selected: unknown;
        component.placeRemoved.subscribe(id => (removedId = id));
        component.placeSelected.subscribe(place => (selected = place));

        fixture.nativeElement.querySelector('li[role="option"] button').click();

        expect(removedId).toBe('1');
        expect(selected).toBeUndefined();
    });

    it('emits closed when the close button is clicked', () => {
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        let closed = false;
        component.closed.subscribe(() => (closed = true));

        fixture.nativeElement.querySelector('[aria-label="Fechar"]').click();

        expect(closed).toBe(true);
    });

    it('emits closed when the backdrop is clicked', () => {
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        let closed = false;
        component.closed.subscribe(() => (closed = true));

        fixture.nativeElement.querySelector('.fixed.inset-0.z-40').click();

        expect(closed).toBe(true);
    });

    it('emits closed on Escape', () => {
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        let closed = false;
        component.closed.subscribe(() => (closed = true));

        fixture.nativeElement
            .querySelector('[role="dialog"]')
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(closed).toBe(true);
    });

    it('locks body scroll while open and restores it when closed', () => {
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        expect(document.body.style.overflow).toBe('hidden');

        fixture.componentRef.setInput('open', false);
        fixture.detectChanges();
        TestBed.tick();

        expect(document.body.style.overflow).toBe('');
    });

    it('wraps focus from the last to the first focusable element with Tab', () => {
        const favorites = [new FavoritePlaceMock().entity({ id: '1' })];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        const panel = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
        const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const last = focusable[focusable.length - 1] as HTMLElement;
        const first = focusable[0] as HTMLElement;
        last.focus();

        panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(first);
    });

    it('wraps focus from the first to the last focusable element with Shift+Tab', () => {
        const favorites = [new FavoritePlaceMock().entity({ id: '1' })];
        fixture.componentRef.setInput('favorites', favorites);
        fixture.componentRef.setInput('open', true);
        fixture.detectChanges();
        TestBed.tick();

        const panel = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
        const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        first.focus();

        panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(last);
    });
});
