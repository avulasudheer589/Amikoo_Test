import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';

test.describe('Join Game Page', () => {
  test('should show Room Not Found for a non-existent game code', async ({ joinGamePage }) => {
    await joinGamePage.goto('INVALID1');
    await expect(joinGamePage.roomNotFoundMessage).toBeVisible();
  });

  test('should show Room Not Found for an arbitrary code entered from Home', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.joinGame('ZZZZZZZZ');
    await expect(page).toHaveURL(/#\/join\/ZZZZZZZZ/);
    await expect(page.getByText('Room not found')).toBeVisible();
  });

  test('should navigate back to Home from Room Not Found page', async ({ joinGamePage }) => {
    await joinGamePage.goto('INVALID1');
    await expect(joinGamePage.roomNotFoundMessage).toBeVisible();
    await joinGamePage.goHome();
    await expect(joinGamePage.page).toHaveURL(/#\//);
  });

  test('should not allow a game code longer than 8 characters from Home input', async ({ homePage }) => {
    // The input has a maxlength of 8
    await homePage.goto();
    await homePage.gameCodeInput.fill('TOOLONGCODE');
    const value = await homePage.gameCodeInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(8);
  });
});
