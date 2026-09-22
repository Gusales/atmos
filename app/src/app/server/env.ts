import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Sobe diretórios a partir de `startDir` até achar um `.env`. Necessário
 * porque o offset até a raiz do projeto muda entre dev (`src/server.ts`)
 * e build (`dist/app/server/server.mjs`), então não dá pra fixar um `../..`.
 */
function findEnvFile(startDir: string): string | null {
    let currentDir = startDir

    for (let i = 0; i < 6; i++) {
        const candidate = join(currentDir, '.env')
        if (existsSync(candidate)) return candidate

        const parentDir = dirname(currentDir)
        if (parentDir === currentDir) break
        currentDir = parentDir
    }

    return null
}

try {
    const envFile = findEnvFile(import.meta.dirname)
    if (envFile) process.loadEnvFile(envFile)
} catch {
    // Sem .env disponível (ex: produção usando variáveis de ambiente reais) — ok ignorar.
}
