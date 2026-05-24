'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react'

const UFOP_RED = 'var(--color-primary)'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o Orion, assistente da plataforma UFOP. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Erro ao obter resposta.'
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 h-[460px] flex flex-col rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden"
          style={{ backgroundColor: '#111113' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800" style={{ backgroundColor: UFOP_RED }}>
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-white" />
              <span className="text-white text-sm font-black">Orion</span>
              <span className="text-red-200 text-[10px]">Assistente UFOP</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-xl"
                  style={msg.role === 'user'
                    ? { backgroundColor: UFOP_RED, color: 'white', borderBottomRightRadius: '4px' }
                    : { backgroundColor: '#1e1e22', color: '#d4d4d8', borderBottomLeftRadius: '4px' }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-3 py-2 rounded-xl flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-zinc-400" />
                  <span className="text-xs text-zinc-400">Digitando...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-800 flex gap-2">
            <input
              className="flex-1 bg-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-2 outline-none placeholder-zinc-500 border border-zinc-700 focus:border-zinc-500 transition-colors"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ backgroundColor: UFOP_RED }}
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Fechar assistente Orion' : 'Abrir assistente Orion'}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: UFOP_RED }}
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </div>
  )
}
