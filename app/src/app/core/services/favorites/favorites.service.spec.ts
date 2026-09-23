import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FavoritePlaceMock } from './favorites.mock';
import { FavoritesService } from './favorites.service';

const STORAGE_KEY = 'atmos:favorites';

describe('FavoritesService', () => {
    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
    });

    function createService(): FavoritesService {
        return TestBed.inject(FavoritesService);
    }

    it('starts empty when localStorage has nothing saved', () => {
        expect(createService().favorites()).toEqual([]);
    });

    it('loads favorites already saved in localStorage on construction', () => {
        const saved = [new FavoritePlaceMock().entity()];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

        expect(createService().favorites()).toEqual(saved);
    });

    it('ignores corrupted localStorage content and starts empty', () => {
        localStorage.setItem(STORAGE_KEY, 'not-json');

        expect(createService().favorites()).toEqual([]);
    });

    describe('isFavorite', () => {
        it('returns false when the id is not in the list', () => {
            expect(createService().isFavorite('123')).toBe(false);
        });

        it('returns true when the id is in the list', () => {
            const service = createService();
            service.add(new FavoritePlaceMock().entity({ id: '123' }));

            expect(service.isFavorite('123')).toBe(true);
        });
    });

    describe('add', () => {
        it('adds a new favorite', () => {
            const service = createService();
            const favorite = new FavoritePlaceMock().entity();

            service.add(favorite);

            expect(service.favorites()).toEqual([favorite]);
        });

        it('does not add a duplicate with the same id', () => {
            const service = createService();
            const favorite = new FavoritePlaceMock().entity({ id: '123' });

            service.add(favorite);
            service.add({ ...favorite, name: 'Different name' });

            expect(service.favorites()).toHaveLength(1);
            expect(service.favorites()[0].name).toBe(favorite.name);
        });
    });

    describe('remove', () => {
        it('removes a favorite by id', () => {
            const service = createService();
            service.add(new FavoritePlaceMock().entity({ id: '123' }));

            service.remove('123');

            expect(service.favorites()).toEqual([]);
        });

        it('does nothing when the id is not in the list', () => {
            const service = createService();
            const favorite = new FavoritePlaceMock().entity({ id: '123' });
            service.add(favorite);

            service.remove('does-not-exist');

            expect(service.favorites()).toEqual([favorite]);
        });
    });

    describe('toggle', () => {
        it('adds the favorite when it is not in the list', () => {
            const service = createService();

            service.toggle(new FavoritePlaceMock().entity({ id: '123' }));

            expect(service.isFavorite('123')).toBe(true);
        });

        it('removes the favorite when it is already in the list', () => {
            const service = createService();
            const favorite = new FavoritePlaceMock().entity({ id: '123' });
            service.add(favorite);

            service.toggle(favorite);

            expect(service.isFavorite('123')).toBe(false);
        });
    });

    describe('persistence', () => {
        it('persists the favorites list to localStorage whenever it changes', () => {
            const service = createService();
            const favorite = new FavoritePlaceMock().entity({ id: '123' });

            service.add(favorite);
            TestBed.tick();

            expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([favorite]);
        });
    });
});
