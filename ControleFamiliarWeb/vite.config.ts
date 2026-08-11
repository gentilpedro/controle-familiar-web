import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Espelha em desenvolvimento o rewrite que o vercel.json faz em produção: o
  // navegador fala só com localhost:5173 e o Vite repassa /api/* para a API.
  // Sem isso o front seria uma origem e a API outra, o cookie de sessão viraria
  // cookie de terceiro e o login não funcionaria no Safari nem no Firefox.
  const alvoDaApi = env.API_PROXY_TARGET ?? 'https://localhost:7106'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: alvoDaApi,
          changeOrigin: true,
          // A API local sobe com certificado de desenvolvimento, que não é
          // confiável para o proxy — sem isto toda chamada falha com
          // UNABLE_TO_VERIFY_LEAF_SIGNATURE.
          secure: false
        }
      }
    }
  }
})
