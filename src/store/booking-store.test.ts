import { beforeEach, describe, expect, it } from 'vitest'
import { useBookingStore } from './booking-store'
import type { Property } from '@/types'

/**
 * Testovi kaskadne logike store-a — pravo biznis pravilo sa edge-case-ovima.
 * Store testiramo direktno preko `getState()` (bez React rendera): akcije su tu,
 * a posle svake `getState()` vrati svežu vrednost.
 */

//Mala fabrika koja napravi lažan hotel po id. as Property
const makeProperty = (id: string) =>
  ({ id, name: `Hotel ${id}`, type: 'hotel' }) as Property

//Gotova stavka korpe koju dodajemo u testovima. (Bez id — store ga sam generiše
// preko crypto.randomUUID().)
const cartInput = {
  unitId: '201',
  rateId: '2001',
  quantity: 1,
  unitName: 'Deluxe Double',
  rateName: 'Bed & Breakfast',
  boardType: 'BB',
  unitPrice: 360,
  adults: 2,
  children: 0,
}

const dates = (checkin: string, checkout: string) => ({
  checkin,
  checkout,
  nights: 3,
})

const store = () => useBookingStore.getState()

// Čista tabla pre svakog testa.
beforeEach(() => {
  store().reset()
})

describe('booking-store', () => {
  it('setProperty upiše hotel i poništi datume + korpu', () => {
    store().setDates(dates('2026-07-01', '2026-07-04'))
    store().addToCart(cartInput)
    expect(store().cart).toHaveLength(1)

    store().setProperty(makeProperty('p1'))

    expect(store().property?.id).toBe('p1')
    expect(store().dates).toBeNull()
    expect(store().cart).toHaveLength(0)
  })

  it('addToCart dodaje stavku sa jedinstvenim generisanim id-jem', () => {
    store().addToCart(cartInput)
    store().addToCart(cartInput)

    const cart = store().cart
    expect(cart).toHaveLength(2)
    expect(cart[0].id).toBeTruthy()
    expect(cart[0].id).not.toBe(cart[1].id)
  })

  it('updateCartItem menja samo ciljanu stavku', () => {
    store().addToCart(cartInput)
    const id = store().cart[0].id

    store().updateCartItem(id, { adults: 4 })

    expect(store().cart[0].adults).toBe(4)
  })

  it('removeCartItem izbacuje stavku po id-ju', () => {
    store().addToCart(cartInput)
    const id = store().cart[0].id

    store().removeCartItem(id)

    expect(store().cart).toHaveLength(0)
  })

  it('setDates ČUVA korpu kad su datumi isti', () => {
    store().setDates(dates('2026-07-01', '2026-07-04'))
    store().addToCart(cartInput)

    store().setDates(dates('2026-07-01', '2026-07-04')) // ista potvrda

    expect(store().cart).toHaveLength(1)
  })

  it('setDates BRIŠE korpu kad se datumi promene (druge cene)', () => {
    store().setDates(dates('2026-07-01', '2026-07-04'))
    store().addToCart(cartInput)

    store().setDates(dates('2026-07-10', '2026-07-13')) // drugi datumi

    expect(store().cart).toHaveLength(0)
  })

  it('reset vraća ceo wizard na početno stanje', () => {
    store().setProperty(makeProperty('p1'))
    store().setDates(dates('2026-07-01', '2026-07-04'))
    store().addToCart(cartInput)

    store().reset()

    expect(store().property).toBeNull()
    expect(store().dates).toBeNull()
    expect(store().cart).toHaveLength(0)
    expect(store().guest).toBeNull()
    expect(store().booking).toBeNull()
  })
})
