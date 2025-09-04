export default interface App {
  Id: string
  Created: string
  State: State
  Image: string
  Name: string
  RestartCount: number
  Config: Config
}

export interface State {
  Status: string
  ExitCode: number
  Error: string
  StartedAt: string
  FinishedAt: string
}

export interface Config {
  Labels: Labels
}

export interface Labels {
  "com.docker.compose.project": string
  "com.docker.compose.project.config_files": string
  "com.docker.compose.project.working_dir": string
  "com.docker.compose.replace": string
}
