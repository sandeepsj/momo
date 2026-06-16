// Centralized LLM proxy — no per-project API keys. The proxy verifies the same
// Google access token the SPA already holds and forwards to the provider.
// Repo: github.com/sandeepsj/llm-proxy

const PROXY = 'https://llm-proxy-smoky.vercel.app/api/proxy'

export async function llmProxy(
  provider: 'openai' | 'anthropic' | 'google',
  endpoint: string,
  body: Record<string, unknown>,
  token: string,
): Promise<Response> {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ provider, endpoint, body }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}) as { error?: string })
    if (res.status === 401) throw new Error('Session expired — sign in again.')
    if (res.status === 403) throw new Error('Your email is not on the proxy allowlist.')
    throw new Error(detail.error || `proxy ${res.status}`)
  }
  return res
}

interface AnthropicTextResponse {
  content: { type: string; text?: string }[]
}

/**
 * Transcribe a prescription / medical document image into clean text using
 * Claude vision. `dataUrl` is a base64 data URL (see drive.mediaDataUrl).
 */
export async function transcribePrescription(dataUrl: string, token: string): Promise<string> {
  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/s.exec(dataUrl)
  if (!match) throw new Error('Unsupported image format for transcription')
  const [, mediaType, base64] = match

  const res = await llmProxy(
    'anthropic',
    'messages',
    {
      model: 'claude-opus-4-8',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text:
                'This is a veterinary prescription or medical document for a pet. ' +
                'Transcribe it faithfully into clean, readable text. Preserve every ' +
                'medication name, dosage, frequency and duration exactly. Use a ' +
                'bulleted list for medications. After the transcription, add a short ' +
                '"Summary" line in plain language. Do not invent anything not visible.',
            },
          ],
        },
      ],
    },
    token,
  )

  const data = (await res.json()) as AnthropicTextResponse
  const text = data.content
    ?.filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')
    .trim()
  if (!text) throw new Error('No transcript returned')
  return text
}
