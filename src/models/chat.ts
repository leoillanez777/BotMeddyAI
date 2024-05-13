export type Message = {
  message: string
  history: string
  model?: string
  phone_number?: string
  temperature?: number | 0
  max_tokens?: number | 326
  presence_penalty?: number | 0
  frequency_penalty?: number | 0
  top_k?: number | 0
}

export type ResponseChat = {
  fecha?: string
  exact: boolean
  message: string
}