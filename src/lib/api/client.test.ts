import { describe, expect, it } from 'vitest'
import { apiClient, ApiError } from './client'

/**
 * Testira axios interceptor: oba oblika API greške moraju da se svedu na jednu
 * `ApiError` sa čistom porukom. Umesto pravog poziva, podmetnemo axios `adapter`
 * koji "padne" sa zadatim telom — tako kontrolišemo response bez mreže.
 */
function rejectWith(data: unknown, status: number) {
  apiClient.defaults.adapter = async () => {
    throw Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { data, status, statusText: '', headers: {}, config: {} },
    })
  }
}

/*
Ovo je integration test: spajam axios i svoj interceptor, ali podmetnem adapter 
   umesto mreže — pa je determinisičan. Proveravam da oba oblika API greške (logička
  + Zod) i nepoznat slučaj uvek završe kao jedna čista ApiError. Time UI nikad ne
  brine koji je oblik stigao
*/

describe('apiClient interceptor — normalizacija grešaka', () => {
  it('ErrorResponse → ApiError sa porukom, statusom i kodom', async () => {
    rejectWith({ error: 'not_found', message: 'Property not found' }, 404)

    await expect(apiClient.get('/x')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Property not found',
      status: 404,
      code: 'not_found',
    })
  })

  it('Zod greška → deserijalizuje i izvuče PRVU issue poruku', async () => {
    rejectWith(
      {
        success: false,
        error: {
          name: 'ZodError',
          message: JSON.stringify([
            {
              code: 'invalid_format',
              path: ['checkin'],
              message: 'YYYY-MM-DD',
            },
            { code: 'too_small', path: ['nights'], message: 'Too small' },
          ]),
        },
      },
      400,
    )

    await expect(apiClient.get('/x')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'YYYY-MM-DD', // prva poruka iz serijalizovanog niza
      code: 'validation_error',
    })
  })

  it('nepoznat oblik → fallback ApiError (i dalje instanca ApiError)', async () => {
    rejectWith({ nesto: 'čudno' }, 500)

    await expect(apiClient.get('/x')).rejects.toBeInstanceOf(ApiError)
  })
})
