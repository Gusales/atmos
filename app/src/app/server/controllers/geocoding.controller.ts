import { AbstractController } from '@/app/shared/abstracts';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { UpstreamGeoCodingApiError } from '../errors/';

/**
 * O Nominatim não casa palavras acentuadas com o nome de assentamentos
 * indexados (ex: buscar "Carapicuíba" não encontra a cidade "Carapicuíba",
 * só ruas com nome parecido) — remover os acentos antes de mandar pra API
 * resolve, e ele já devolve o resultado com acentuação normal.
 */
function stripDiacritics(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export class GeoCodingController extends AbstractController {
    private readonly geocodingApiUrl: string
    private readonly pathSearch: string = '/search'
    private readonly pathSearchByLatitudeAndLongitude: string = '/reverse'

    constructor(
        geocodingApiUrl?: string
    ) {
        super();
        this.geocodingApiUrl = geocodingApiUrl || process.env['GEOCODING_API_URL'] || ''
    }

    public async getLocationBySearch(req: ExpressRequest, res: ExpressResponse): Promise<void> {
        const context: string = '[GeoCodingController.getLocationBySearch]'
        try {
            const search = req.query['search'] as string
            const geocodingApi = this.buildGeoCodingApi(this.pathSearch)
            geocodingApi.searchParams.set('q', stripDiacritics(search))

            const request = await fetch(geocodingApi, {
                headers: this.getDefaultHeaders()
            })

            if (!request.ok) {
                throw new UpstreamGeoCodingApiError(request.status, await request.text())
            }

            const response = await request.json()

            res.status(200).send({ data: response })
        } catch (error) {
            this.handleError(error, context, res);
        }
    }

    public async getLocationByLatitudeAndLongitude(req: ExpressRequest, res: ExpressResponse): Promise<void> {
        const context: string = '[GeoCodingController.getLocationByLatitudeAndLongitude]'
        try {
            const latitude = req.query['latitude'] as string
            const longitude = req.query['longitude'] as string
            
            const geocodingApi = this.buildGeoCodingApi(this.pathSearchByLatitudeAndLongitude)

            geocodingApi.searchParams.set('lat', latitude)
            geocodingApi.searchParams.set('lon', longitude)

            const request = await fetch(geocodingApi, {
                headers: this.getDefaultHeaders()
            })

            if (!request.ok) {
                console.log('Erro ao fazer request para a api. url', geocodingApi.toString())
                throw new UpstreamGeoCodingApiError(request.status, await request.text())
            }

            const response = await request.json()

            res.status(200).send({ data: response })
        } catch (error) {
            this.handleError(error, context, res);
        }
    }

    private buildGeoCodingApi(path: string): URL {
        const geocodingApi = new URL(`${this.geocodingApiUrl}/${path}`);
        return this.setDefaultQueryParams(geocodingApi);
    }

    private setDefaultQueryParams(geocodingApi: URL): URL {
        geocodingApi.searchParams.set('format', 'json');
        geocodingApi.searchParams.set('accept-language', 'pt-BR');
        geocodingApi.searchParams.set('limit', '10');
        geocodingApi.searchParams.set('addressdetails', '1');
        geocodingApi.searchParams.set('featureType', 'settlement');

        return geocodingApi;
    }
}