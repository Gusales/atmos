import { stubGeolocation } from '../../cypress/support/e2e'

describe('Dashboard (e2e)', () => {
    beforeEach(() => {
        cy.mockGeocodingCoordinates()
        cy.mockWeatherApi()

        cy.visit('/', { onBeforeLoad: stubGeolocation() })

        cy.wait('@getCoordinates')
        cy.wait('@getWeather')
    })

    it('renders the current weather for the resolved location', () => {
        cy.get('#app').should('exist')
        cy.get('app-current-weather').should('contain.text', 'São Paulo, SP')
        cy.get('app-current-weather').should('contain.text', '22')
    })

    it('renders air quality, sky cycle, weekly and hourly forecast cards', () => {
        cy.get('app-air-quality').should('exist')
        cy.get('app-sky-cycle').should('exist')
        cy.get('app-weakly-forecast').should('exist')
        cy.get('app-hourly-forecast').should('exist').should('contain.text', 'Próximas horas')
    })
})
