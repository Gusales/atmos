import { stubGeolocation } from '../../cypress/support/e2e'

describe('Favorites (e2e)', () => {
    beforeEach(() => {
        cy.clearLocalStorage()

        cy.mockGeocodingCoordinates()
        cy.mockWeatherApi()

        cy.visit('/', { onBeforeLoad: stubGeolocation() })

        cy.wait('@getCoordinates')
        cy.wait('@getWeather')
    })

    it('favorites the current place, lists it in the modal, and removes it', () => {
        cy.get('button[aria-pressed]').should('have.attr', 'aria-pressed', 'false').click()
        cy.get('button[aria-pressed]').should('have.attr', 'aria-pressed', 'true')

        cy.get('[aria-label="Abrir favoritos"]').click()
        cy.get('[role="dialog"]').should('be.visible')
        cy.get('[role="dialog"] [role="option"]').should('have.length', 1).and('contain.text', 'São Paulo')

        cy.get('[role="dialog"] [aria-label="Remover dos favoritos"]').click()
        cy.get('[role="dialog"]').should('contain.text', 'Nenhum lugar favoritado ainda')
    })

    it('closes the favorites modal on Escape', () => {
        cy.get('[aria-label="Abrir favoritos"]').click()
        cy.get('[role="dialog"]').should('be.visible')

        cy.get('[role="dialog"]').type('{esc}')
        cy.get('[role="dialog"]').should('not.exist')
    })
})
