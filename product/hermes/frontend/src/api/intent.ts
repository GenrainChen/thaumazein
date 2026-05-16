import { post, get } from './client'

export interface Requirement {
  id: string
  project_id: string
  text: string
  structured_data: Record<string, unknown> | null
  status: string
  created_at: string
}

export interface Goal {
  id: string
  project_id: string
  parent_id: string | null
  text: string
  status: string
  order: number
}

export interface GoalCreateItem {
  text: string
  children: GoalCreateItem[]
}

export const createRequirement = (projectId: string, text: string) =>
  post<Requirement>(`/intent/projects/${projectId}/requirements`, { text })

export const listRequirements = (projectId: string) =>
  get<Requirement[]>(`/intent/projects/${projectId}/requirements`)

export const parseRequirement = (projectId: string, text: string) =>
  post<{ goals: GoalCreateItem[] }>(`/intent/projects/${projectId}/parse`, { text })

export const saveGoals = (projectId: string, goals: GoalCreateItem[]) =>
  post<Goal[]>(`/intent/projects/${projectId}/goals`, { goals })

export const listGoals = (projectId: string) =>
  get<Goal[]>(`/intent/projects/${projectId}/goals`)
