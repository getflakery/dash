import type { Avatar } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'

export interface Template {
  id?: string
  name?: string
  githubID?: string
  flakeUrl: string
  awsInstanceType?: string
}

export interface Instance {
  id: string
  domain: string
  ip: string
  template: Template
}

export interface File {
  id: string
  path: string
  content: string 
}

export interface Mail {
  id: number
  unread?: boolean
  from: Template
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: Avatar
}

export interface Notification {
  id: number
  unread?: boolean
  sender: Template
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
