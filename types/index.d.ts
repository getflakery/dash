import type { Avatar } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export interface Template {
  name?: string
  flakeUrl: string
};

export interface Instance {
  id?: string
  template?: Template
  name: string
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