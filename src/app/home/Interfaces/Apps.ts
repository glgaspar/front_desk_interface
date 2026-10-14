export default interface App {
  id: string
  created: string
  state: State
  image: string
  imageRef: string
  port?: string
  cloudflarePort?: string
  name: string
  url: string
  dir: string
  logo?: string

}
export interface State {
  status: string
  exitCode: number
  error: string
  startedAt: string
  finishedAt: string
}


export interface AppStats {
  id: string
  name: string
  cpuPercent: number
  memPercent: number
  memUsage: string
  netIO: string
  blockIO: string
  pids: string
}

export interface UpdateStatus {
  imageRef: string
  localDigest: string
  remoteDigest: string
  status: "up_to_date" | "update_available" | "unsupported" | "rate_limited" | "error"
  error: string
  checkedAt: string
}

export interface WaitingBuild {
  topic: string
  messages: string[]
}