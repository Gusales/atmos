export {}

declare global {
    namespace Cypress {
        interface Chainable {
            mockWeatherApi(fixture?: string): Chainable<null>
            mockGeocodingCoordinates(fixture?: string): Chainable<null>
            mockGeocodingSearch(fixture?: string): Chainable<null>
        }
    }
}

Cypress.Commands.add('mockWeatherApi', (fixture = 'weather-response.json') => {
    return cy.intercept('GET', '/api/weather*', { fixture }).as('getWeather')
})

Cypress.Commands.add('mockGeocodingCoordinates', (fixture = 'geocoding-coordinates.json') => {
    return cy.intercept('GET', '/api/geocoding/coordinates*', { fixture }).as('getCoordinates')
})

Cypress.Commands.add('mockGeocodingSearch', (fixture = 'geocoding-search.json') => {
    return cy.intercept('GET', '/api/geocoding?*', { fixture }).as('searchPlaces')
})
