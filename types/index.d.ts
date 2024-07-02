import type { Avatar } from '#ui/types'
import type { Deployment } from '~/mod/deployment'




export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export interface Template {
  id: string
  name?: string
  flakeURL: string
  deployments: Deployment[]
  host: string
};

export interface Deployment {
  id: string
  templateID: string
  name?: string
  logs: {
      date: number,
      exec: string,
      host: string,
  }[],
  host: string,
  production: boolean,

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

export interface RuntimeConfig {
  turso_token: string,
  file_encryption_key: string,
  github_token: string,
  public: {
    vpc_id: string,
    public_subnet_1: string,
    public_subnet_2: string,
    private_subnet_1: string,
    private_subnet_2: string,
    image_id: string,
  }
}