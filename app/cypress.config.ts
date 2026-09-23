import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        specPattern: 'test/e2e/**/*.cy.ts',
        supportFile: 'cypress/support/e2e.ts'
    }
})
