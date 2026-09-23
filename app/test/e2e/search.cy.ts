import { stubGeolocation } from '../../cypress/support/e2e'

describe('PlaceSearch (e2e)', () => {
    beforeEach(() => {
        cy.mockGeocodingCoordinates()
        cy.mockWeatherApi()

        cy.visit('/', { onBeforeLoad: stubGeolocation() })

        cy.wait('@getCoordinates')
        cy.wait('@getWeather')
    })

    it('searches, navigates the dropdown by keyboard and selects a result', () => {
        cy.mockGeocodingSearch()

        cy.get('[role="combobox"]').type('Bar')
        cy.wait('@searchPlaces')

        cy.get('#place-search-listbox [role="option"]').should('have.length', 2)

        cy.get('[role="combobox"]').type('{downarrow}')
        cy.get('#place-search-listbox [role="option"]').eq(0).should('have.attr', 'aria-selected', 'true')

        cy.mockWeatherApi('weather-response-barueri.json')

        cy.get('[role="combobox"]').type('{enter}')
        cy.wait('@getWeather')

        cy.get('app-current-weather').should('contain.text', 'Barueri, SP')
        cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'false')
    })

    it('closes the dropdown when clicking outside', () => {
        cy.mockGeocodingSearch()

        cy.get('[role="combobox"]').type('Bar')
        cy.wait('@searchPlaces')
        cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'true')

        cy.get('body').click(0, 0)
        cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'false')
    })
})
