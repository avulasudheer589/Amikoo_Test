import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';

test.describe('My Quizzes Page', () => {
  test.beforeEach(async ({ myQuizzesPage }) => {
    await myQuizzesPage.goto();
  });

  test('should display empty state when no quizzes exist', async ({ myQuizzesPage }) => {
    // Assumes a clean localStorage state (no saved quizzes)
    await expect(myQuizzesPage.emptyStateMessage).toBeVisible();
    await expect(myQuizzesPage.buildFirstQuizBtn).toBeVisible();
  });

  test('should navigate to Create Quiz from empty state button', async ({ myQuizzesPage, page }) => {
    await myQuizzesPage.buildFirstQuizBtn.click();
    await expect(page).toHaveURL(/#\/create/);
  });

  test('should navigate to Create Quiz via New Quiz button', async ({ myQuizzesPage, page }) => {
    await myQuizzesPage.createNewQuiz();
    await expect(page).toHaveURL(/#\/create/);
  });

  test('should navigate back to Home via Home button', async ({ myQuizzesPage, page }) => {
    await myQuizzesPage.goHome();
    await expect(page).toHaveURL(/#\//);
  });

  test('should display a quiz card after creating a quiz', async ({ myQuizzesPage, createQuizPage, page }) => {
    // Create a quiz first
    await createQuizPage.goto();
    await createQuizPage.fillQuizTitle('My Test Quiz');
    await createQuizPage.fillQuestion(0, {
      text: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctAnswer: 'B',
      timeLimit: 20,
    });
    await createQuizPage.saveQuiz();

    // Now verify it appears in My Quizzes
    await myQuizzesPage.goto();
    await expect(myQuizzesPage.quizCardByTitle('My Test Quiz')).toBeVisible();
  });

  test('should delete a quiz and show empty state', async ({ myQuizzesPage, createQuizPage }) => {
    // Create a quiz first
    await createQuizPage.goto();
    await createQuizPage.fillQuizTitle('Quiz To Delete');
    await createQuizPage.fillQuestion(0, {
      text: 'Sample question?',
      optionA: 'A',
      optionB: 'B',
      optionC: 'C',
      optionD: 'D',
      correctAnswer: 'A',
    });
    await createQuizPage.saveQuiz();

    // Delete it
    await myQuizzesPage.goto();
    await myQuizzesPage.deleteQuiz('Quiz To Delete');

    // Should return to empty state
    await expect(myQuizzesPage.emptyStateMessage).toBeVisible();
  });

  test('should open edit form for an existing quiz', async ({ myQuizzesPage, createQuizPage, page }) => {
    // Create a quiz first
    await createQuizPage.goto();
    await createQuizPage.fillQuizTitle('Quiz To Edit');
    await createQuizPage.fillQuestion(0, {
      text: 'Sample question?',
      optionA: 'A',
      optionB: 'B',
      optionC: 'C',
      optionD: 'D',
      correctAnswer: 'B',
    });
    await createQuizPage.saveQuiz();

    // Edit it
    await myQuizzesPage.goto();
    await myQuizzesPage.editQuiz('Quiz To Edit');
    await expect(page).toHaveURL(/#\/create/);
  });

  test('should navigate to host page when Host button is clicked', async ({ myQuizzesPage, createQuizPage, page }) => {
    // Create a quiz first
    await createQuizPage.goto();
    await createQuizPage.fillQuizTitle('Quiz To Host');
    await createQuizPage.fillQuestion(0, {
      text: 'Sample question?',
      optionA: 'A',
      optionB: 'B',
      optionC: 'C',
      optionD: 'D',
      correctAnswer: 'C',
    });
    await createQuizPage.saveQuiz();

    // Host it
    await myQuizzesPage.goto();
    await myQuizzesPage.hostQuiz('Quiz To Host');
    await expect(page).toHaveURL(/#\/host\//);
  });
});
