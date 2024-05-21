import type { Avatar } from '#ui/types'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export interface Template {
  id: string
  name?: string
  flakeURL: string
  deployments: Deployment[]
};

export interface Deployment {
  id: string
  templateID: string
  name?: string
  logs: {
    date: number,
    exec: string
  }[],
  network: Network
};

export interface File {
  id?: string
  path: string
  content: string
}

export interface Network {
  id: string
  domain: string
  ports: Port[]
}

export interface Port {
  id: string,
  number: integer,
}