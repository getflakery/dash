import type { Avatar } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export interface Template {
  id: string
  name?: string
  flakeURL: string
};

export interface Instance {
  id: string
  templateID: string
  name?: string
  logs: {
    items: {
      content: string
    }[]
  }
};

export interface File {
  id?: string
  path: string
  content: string 
}

export interface Networking {
  id?: string
  domain: string
  ip: string
}