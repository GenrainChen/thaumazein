import { get, post, del } from './client'

export interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectStatus extends Project {
  requirement_count: number
  goal_count: number
  has_mind_map: boolean
  has_flow_chart: boolean
  behavior_pack_count: number
}

export const createProject = (name: string, description?: string) =>
  post<Project>('/dashboard/projects', { name, description })

export const listProjects = () => get<Project[]>('/dashboard/projects')

export const getProject = (id: string) => get<ProjectStatus>(`/dashboard/projects/${id}`)

export const deleteProject = (id: string) => del<{ ok: boolean }>(`/dashboard/projects/${id}`)
