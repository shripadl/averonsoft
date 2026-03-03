'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Bot, User, Zap } from 'lucide-react'
import { ActionPlanPreview } from './ActionPlanPreview'
import type { AIFileAction } from '@/lib/ai-workspace/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  parsedActions?: AIFileAction[]
  explanation?: string
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (content: string, preferHighQuality?: boolean, agentMode?: boolean) => Promise<void>
  isLoading?: boolean
  fileContext?: string
  disabled?: boolean
  filePaths?: string[]
  onApplyActions?: (actions: AIFileAction[]) => Promise<void>
}

export function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  disabled = false,
  filePaths = [],
  onApplyActions,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [preferHighQuality, setPreferHighQuality] = useState(false)
  const [agentMode, setAgentMode] = useState(false)
  const [applyingActions, setApplyingActions] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading || disabled) return

    setInput('')
    await onSendMessage(trimmed, preferHighQuality, agentMode)
  }

  async function handleApplyPlan(actions: AIFileAction[]) {
    if (!onApplyActions) return
    setApplyingActions(true)
    try {
      await onApplyActions(actions)
    } finally {
      setApplyingActions(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-surface">
      <div className="border-b border-border p-3">
        <h3 className="text-sm font-medium text-foreground">AI Assistant</h3>
        {disabled ? (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
            AI tool is currently disabled. Contact your administrator to enable it.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={agentMode}
                onChange={e => setAgentMode(e.target.checked)}
                className="rounded border-border"
              />
              <Zap className="h-3.5 w-3.5" />
              Agent mode (structured output)
            </label>
            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={preferHighQuality}
                onChange={e => setPreferHighQuality(e.target.checked)}
                className="rounded border-border"
              />
              Prefer high quality (slower)
            </label>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-sm text-foreground-muted">
            Ask anything about your code. Try: &quot;Explain this function&quot; or &quot;Refactor for readability&quot;
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-elevated border border-border text-foreground'
                }`}
              >
                {msg.parsedActions && msg.parsedActions.length > 0 && onApplyActions ? (
                  <ActionPlanPreview
                    actions={msg.parsedActions}
                    explanation={msg.explanation}
                    onApprove={() => handleApplyPlan(msg.parsedActions!)}
                    onReject={() => {}}
                    isLoading={applyingActions}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <div className="rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-foreground-muted">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={disabled ? 'AI disabled' : 'Ask about your code...'}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || disabled}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading || disabled}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
