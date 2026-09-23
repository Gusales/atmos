import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BaseService } from './base.service';

@Injectable()
class TestBaseService extends BaseService {
    constructor(httpClient: HttpClient) {
        super(httpClient, 'items')
    }

    build(path: string): string {
        return this.REQUEST(path)
    }

    getItems() {
        return this.GET('/list')
    }
}

@Injectable()
class RootBaseService extends BaseService {
    constructor(httpClient: HttpClient) {
        super(httpClient, '')
    }

    build(path: string = ''): string {
        return this.REQUEST(path)
    }
}

@Injectable()
class TrailingSlashBaseService extends BaseService {
    constructor(httpClient: HttpClient) {
        super(httpClient, 'items/')
    }

    build(path: string = ''): string {
        return this.REQUEST(path)
    }
}

describe('BaseService', () => {
    let service: TestBaseService;
    let rootService: RootBaseService;
    let trailingSlashService: TrailingSlashBaseService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                TestBaseService,
                RootBaseService,
                TrailingSlashBaseService
            ]
        });
        service = TestBed.inject(TestBaseService);
        rootService = TestBed.inject(RootBaseService);
        trailingSlashService = TestBed.inject(TrailingSlashBaseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('REQUEST', () => {
        it('joins basePath and path with a single slash', () => {
            expect(service.build('/list')).toBe('/items/list');
        });

        it('adds a leading slash to path when missing', () => {
            expect(service.build('list')).toBe('/items/list');
        });

        it('adds a leading slash to basePath when missing', () => {
            expect(service.build('/list')).toBe('/items/list');
        });

        it('strips a trailing slash from basePath', () => {
            expect(trailingSlashService.build('')).toBe('/items');
        });

        it('returns just the path when basePath is empty', () => {
            expect(rootService.build('/list')).toBe('/list');
        });

        it('returns an empty string when both basePath and path are empty', () => {
            expect(rootService.build()).toBe('');
        });
    });

    describe('GET', () => {
        it('issues a GET request against the normalized path', () => {
            let result: unknown;
            service.getItems().subscribe(value => (result = value));

            const req = httpMock.expectOne('/items/list');
            expect(req.request.method).toBe('GET');
            req.flush({ ok: true });

            expect(result).toEqual({ ok: true });
        });
    });
});
