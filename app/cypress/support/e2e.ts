import './commands'

/**
 * `navigator.geolocation` é uma Web API do browser, não uma chamada de rede
 * — `cy.intercept()` não se aplica. Precisa ser sobrescrita antes do app
 * carregar, via `onBeforeLoad` do `cy.visit()`:
 *
 * ```ts
 * cy.visit('/', { onBeforeLoad: stubGeolocation() })
 * ```
 *
 * As coordenadas padrão são DIFERENTES do fallback hardcoded do dashboard
 * (-23.5505,-46.6333, usado quando a geolocalização falha) de propósito: o
 * app roda em SSR com hidratação, e o `HttpClient` reaproveita (via
 * `TransferState`/`HttpTransferCache`) qualquer resposta já buscada no
 * servidor pra uma URL idêntica — a chamada de clima no SSR sempre cai no
 * fallback (sem `navigator.geolocation` no Node) e busca esse local padrão.
 * Se o teste usasse essas MESMAS coordenadas, a chamada do cliente reaproveitaria
 * o cache e nunca bateria de verdade no browser, então o `cy.intercept()`
 * nunca veria a requisição de clima (só a de geocoding, que o fallback do
 * SSR nunca dispara).
 */
export function stubGeolocation(latitude = -22.9068, longitude = -43.1729) {
    return (win: Cypress.AUTWindow) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(
            (success: PositionCallback) => success({ coords: { latitude, longitude } } as GeolocationPosition)
        )
    }
}
