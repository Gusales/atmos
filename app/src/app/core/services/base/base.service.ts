import { HttpClient } from "@angular/common/http";
import { IHttpOptions } from "../../../shared/interfaces";

export class BaseService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly basePath: string = '/api'
    ) {}

    protected REQUEST(path: string = ''): string {
        const normalizedBasePath = this.basePath
        ? (this.basePath.startsWith('/') ? this.basePath : `/${this.basePath}`).replace(/\/$/, '')
        : ''
        const normalizedPath = path
        ? (path.startsWith('/') ? path : `/${path}`)
        : ''

        return `${normalizedBasePath}${normalizedPath}`
    }

    protected GET<T>(path: string, options?: IHttpOptions) {
        return this.httpClient.get<T>(this.REQUEST(path), options)
    }
}