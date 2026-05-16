import { useState, useEffect, useRef } from 'react'
import { listMessages, sendMessage, type ChatMessage } from '../api/agent'

interface Props {
  projectId: string
}

export default function ChatPanel({ projectId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listMessages(projectId).then(setMessages).catch(() => {})
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const reply = await sendMessage(projectId, text)
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, project_id: projectId, role: 'assistant', content: 'Error: failed to get response.', created_at: new Date().toISOString() },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-8">Start a conversation with the AI design assistant.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg text-sm">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            placeholder="Ask the AI design assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={sending}
          />
          <button
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
