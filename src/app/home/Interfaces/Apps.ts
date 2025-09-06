export default interface App {
  id: string
  created: string
  state: State
  image: string
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
