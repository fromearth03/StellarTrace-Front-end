import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY

  return {
    plugins: [
      react(),
      {
        name: 'gemini-dev-proxy',
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

            if (!geminiApiKey) {
              sendJson(500, { error: 'GEMINI_API_KEY missing in local environment' })
              return
            }

            try {
              let rawBody = ''
              for await (const chunk of req) {
                rawBody += chunk
              }

              const body = rawBody ? JSON.parse(rawBody) : {}
              const prompt = body?.prompt
              const model = (body?.model || 'gemini-2.5-flash').replace(/^google\//, '')

              if (!prompt || typeof prompt !== 'string') {
                sendJson(400, { error: 'Prompt is required' })
                return
              }

              const upstreamResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature: 0.3 }
                })
              })

              const upstreamText = await upstreamResponse.text()
              const upstreamJson = upstreamText ? JSON.parse(upstreamText) : {}

              if (!upstreamResponse.ok) {
                sendJson(upstreamResponse.status, {
                  error: upstreamJson?.error?.message || 'Gemini request failed',
                  details: upstreamJson
                })
                return
              }

              sendJson(200, {
                content: upstreamJson?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('') || ''
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
