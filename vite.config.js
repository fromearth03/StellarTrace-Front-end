import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const openRouterApiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY

  return {
    plugins: [
      react(),
      {
        name: 'openrouter-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/openrouter', async (req, res, next) => {
            if (req.method !== 'POST') {
              next()
              return
            }

            const sendJson = (statusCode, payload) => {
              res.statusCode = statusCode
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(payload))
            }

            if (!openRouterApiKey) {
              sendJson(500, { error: 'OPENROUTER_API_KEY missing in local environment' })
              return
            }

            try {
              let rawBody = ''
              for await (const chunk of req) {
                rawBody += chunk
              }

              const body = rawBody ? JSON.parse(rawBody) : {}
              const prompt = body?.prompt
              const model = body?.model || 'google/gemini-2.5-flash'
              const requestedMaxTokens = body?.max_tokens

              if (!prompt || typeof prompt !== 'string') {
                sendJson(400, { error: 'Prompt is required' })
                return
              }

              const PROMPT_CHAR_LIMIT = 5000
              const MAX_OUTPUT_TOKENS = 1200
              const safePrompt = prompt.slice(0, PROMPT_CHAR_LIMIT)
              const parsedMaxTokens = Number(requestedMaxTokens)
              const safeMaxTokens = Number.isFinite(parsedMaxTokens)
                ? Math.min(Math.max(parsedMaxTokens, 64), MAX_OUTPUT_TOKENS)
                : MAX_OUTPUT_TOKENS

              const upstreamResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${openRouterApiKey}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'http://localhost:5173',
                  'X-Title': 'Stellar Trace Frontend (Local Dev)'
                },
                body: JSON.stringify({
                  model,
                  messages: [{ role: 'user', content: safePrompt }],
                  temperature: 0.3,
                  max_tokens: safeMaxTokens
                })
              })

              const upstreamText = await upstreamResponse.text()
              const upstreamJson = upstreamText ? JSON.parse(upstreamText) : {}

              if (!upstreamResponse.ok) {
                sendJson(upstreamResponse.status, {
                  error: upstreamJson?.error?.message || 'OpenRouter request failed',
                  details: upstreamJson
                })
                return
              }

              sendJson(200, {
                content: upstreamJson?.choices?.[0]?.message?.content || ''
              })
            } catch (error) {
              sendJson(500, { error: error.message || 'Unexpected local proxy error' })
            }
          })
        }
      }
    ],
    server: {
      allowedHosts: ['stellartrace.jarviscore.me'],
    },
  }
})
