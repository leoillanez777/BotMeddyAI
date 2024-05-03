export interface RequestResponse<T> {
  success: boolean
  result?: T
  messages?: string[]
  session_id?: string
}