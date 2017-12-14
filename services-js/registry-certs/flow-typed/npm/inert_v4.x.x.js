declare module 'inert' {
  import type { Reply, Response } from 'hapi'
  
  declare export type ReplyWithInert = {|
    ...Reply,
    file(path: string): Response,
  |};
}
