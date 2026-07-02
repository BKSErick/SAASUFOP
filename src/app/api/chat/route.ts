import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/api-auth'
import { logWarn } from '@/lib/logger'

const SYSTEM_PROMPT = `VocÃª Ã© o Orion, assistente da plataforma UFOP (Universidade Federal de Ouro Preto).
Responda em portuguÃªs brasileiro de forma clara e objetiva.
Ajude professores e alunos com dÃºvidas sobre a plataforma, organizaÃ§Ã£o acadÃªmica e informaÃ§Ãµes gerais da universidade.
Seja cordial, profissional e conciso. MÃ¡ximo 200 palavras por resposta.`

async function callGemini(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(15000),
    }
  )

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error(`Gemini empty: ${JSON.stringify(data?.error || data?.candidates?.[0]?.finishReason)}`)
  return text
}

async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ufop.synkra.com.br',
      'X-Title': 'UFOP Orion Assistant',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(20000),
  })

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error(`OpenRouter empty: ${JSON.stringify(data?.error)}`)
  return text
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response

  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    let reply: string
    try {
      reply = await callGemini(messages)
    } catch (err) {
      logWarn('chat-fallback', 'Gemini failed, trying OpenRouter', err)
      reply = await callOpenRouter(messages)
    }

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'ServiÃ§o temporariamente indisponÃ­vel.' }, { status: 500 })
  }
}
