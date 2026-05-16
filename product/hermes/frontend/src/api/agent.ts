import { get, post } from './client'

export interface ChatMessage {
  id: string
  project_id: string
  role: string
  content: string
  created_at: string
}

export const sendMessage = (projectId: string, message: string) =>
  post<ChatMessage>(`/agent/projects/${projectId}/chat`, { message })

export const listMessages = (projectId: string) =>
  get<ChatMessage[]>(`/agent/projects/${projectId}/messages`)
