const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string || 'pNInz6obpgDQGcFmaJgB' // default: Adam

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export async function speak(text: string): Promise<void> {
  if (!API_KEY) {
    console.warn('ElevenLabs API key not set, skipping TTS')
    return
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: 1.0,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`ElevenLabs TTS error: ${response.status} ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const ctx = getAudioContext()

  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const source = ctx.createBufferSource()
  source.buffer = audioBuffer
  source.connect(ctx.destination)

  return new Promise((resolve) => {
    source.onended = () => resolve()
    source.start(0)
  })
}

export function stopAudio(): void {
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}
