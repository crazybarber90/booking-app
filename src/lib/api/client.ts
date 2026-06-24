import axios, { type AxiosError } from 'axios'
import { isErrorResponse, isZodErrorResponse } from '@/types'

/**
 * Normalizovana greška koju ostatak aplikacije uvek dobija.
 * Bez obzira da li je API vratio `ErrorResponse` ili `ZodError` oblik
 * (vidi ENDPOINTS.md), ovde se sve svodi na jednu čistu klasu sa porukom.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Centralni axios klijent. Bazni URL iz `NEXT_PUBLIC_API_URL` (.env.local).
 * Svi API pozivi idu kroz njega — jedno mesto za baseURL, headere i greške.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  // Ako server visi, prekini posle 10s (umesto beskonačnog čekanja) → interceptor
  // to pretvori u ApiError, pa UI pokaže grešku umesto da večno stoji u loading-u.
  timeout: 10_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data
    const status = error.response?.status

    // Oblik 2: Zod validacija { success:false, error:{ name, message } }
    if (isZodErrorResponse(data)) {
      return Promise.reject(
        new ApiError(
          firstZodIssue(data.error.message) ?? 'Neispravni podaci.',
          status,
          'validation_error',
        ),
      )
    }

    // Oblik 1: logička greška { error, message }
    if (isErrorResponse(data)) {
      return Promise.reject(new ApiError(data.message, status, data.error))
    }

    // Mreža / nepoznato
    return Promise.reject(
      new ApiError(
        error.message || 'Došlo je do greške. Pokušaj ponovo.',
        status,
      ),
    )
  },
)

/** Iz serijalizovanog Zod `message` (JSON niz issue-a) vadi prvu poruku. */
function firstZodIssue(serialized: string): string | undefined {
  try {
    const issues = JSON.parse(serialized) as Array<{ message?: string }>
    return issues[0]?.message
  } catch {
    return undefined
  }
}

// „API vraća greške u dva oblika, a Zod oblik ima
// poruku serijalizovanu kao JSON-string. Type guard-ovima
// razlikujem oblike, JSON.parse-om deserijalizujem Zod
// poruke i izvučem prvu čitljivu, pa sve normalizujem u
// jednu ApiError klasu — tako UI uvek dobije jednu čistu
// poruku bez obzira na izvor."

// Zod oblik se javlja samo na POST endpointima koji imaju
//   telo za validaciju (/availability, /bookings).

// - GET endpointi (nemaju telo) vraćaju samo ErrorResponse
//   (404/500) — nema šta Zod da validira.
