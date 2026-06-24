import { test, expect } from '@playwright/test'
import { BOOKING, PROPERTY, mockApi } from './fixtures'

/**
 * E2E: ceo flow od izbora hotela do potvrde, sa mock-ovanim API-jem.
 * Pokriva ono što unit testovi ne mogu — da koraci rade ZAJEDNO: navigacija,
 * upis u store kroz korake, popunjavanje forme i kreiranje rezervacije.
 */
test('ceo booking flow: hotel → datumi → soba → payment → confirmation', async ({
  page,
}) => {
  await mockApi(page) // presretni API pre učitavanja

  // --- Korak 1: izbor hotela -------------------------------------------------
  await page.goto('/')
  await page.getByRole('button', { name: new RegExp(PROPERTY.name) }).click()
  await expect(page).toHaveURL(/\/dates/)

  // --- Korak 2: izbor datuma (klik 2 dostupna dana → CONFIRM) ----------------
  // Dani kalendara su jedina dugmad sa „€"; uzimamo samo aktivne (ne disabled).
  const dayCells = page
    .locator('button:not([disabled])')
    .filter({ hasText: '€' })
  await dayCells.first().waitFor()
  await dayCells.nth(0).click() // check-in
  await dayCells.nth(4).click() // check-out (+4 dana)
  await page.getByRole('button', { name: 'CONFIRM', exact: true }).click()
  await expect(page).toHaveURL(/\/rooms/)

  // --- Korak 3: izbor sobe (SELECT) → CONTINUE -------------------------------
  await page.getByRole('button', { name: 'SELECT' }).first().click()
  await page.getByRole('button', { name: 'CONTINUE' }).click()
  await expect(page).toHaveURL(/\/payment/)

  // --- Korak 4: popuni formu (guest + kartica) -------------------------------
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel('First name', { exact: true }).fill('Ana')
  await page.getByLabel('Last name', { exact: true }).fill('Anic')
  await page.getByPlaceholder('Enter phone number').fill('912345678')
  await page
    .getByPlaceholder('Enter your credit card number')
    .fill('4242424242424242') // Luhn-validan
  await page.getByLabel('Expiration date').fill('1230') // → 12/30
  await page.getByLabel('CVV').fill('123')
  await page.getByLabel('Card holder first name').fill('Ana')
  await page.getByLabel('Card holder last name').fill('Anic')
  await page.getByText('I have read and agree to the terms of use').click()

  await page.getByRole('button', { name: 'CONFIRM RESERVATION' }).click()

  // --- Korak 5: potvrda ------------------------------------------------------
  await expect(page).toHaveURL(/\/confirmation/)
  await expect(page.getByText('Your reservation is confirmed!')).toBeVisible()
  await expect(page.getByText(BOOKING.bookingId)).toBeVisible()
})
