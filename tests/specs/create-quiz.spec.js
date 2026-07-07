const { test, expect } = require('../fixtures/fixtures');

test.describe('Create Quiz', () => {

  test.beforeEach(async ({ createQuizPage }) => {
    await createQuizPage.goto();
  });

  // ─── Single Question Quiz ───────────────────────────────────────────────────

  test('should display the create quiz form', async ({ createQuizPage }) => {
    await expect(createQuizPage.quizTitleInput).toBeVisible();
    await expect(createQuizPage.questionTextAt(0)).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'A')).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'B')).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'C')).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'D')).toBeVisible();
    await expect(createQuizPage.correctAnswerSelectAt(0)).toBeVisible();
    await expect(createQuizPage.saveQuizBtn).toBeVisible();
    await expect(createQuizPage.saveAndHostBtn).toBeVisible();
    await expect(createQuizPage.cancelBtn).toBeVisible();
  });

  test('should create a quiz with a single question and save it', async ({ createQuizPage, page }) => {
    // Fill quiz title
    await createQuizPage.fillQuizTitle('Geography Quiz');

    // Fill first question
    await createQuizPage.fillQuestion(0, {
      text: 'What is the capital of France?',
      optionA: 'Berlin',
      optionB: 'Madrid',
      optionC: 'Paris',
      optionD: 'Rome',
      correctAnswer: 'C',
      timeLimit: 20,
    });

    // Save the quiz
    await createQuizPage.saveQuiz();

    // Should navigate away from create page after saving
    await expect(page).not.toHaveURL(/#\/create/);
  });

  test('should create a quiz and immediately host it', async ({ createQuizPage, page }) => {
    // Fill quiz title
    await createQuizPage.fillQuizTitle('Science Quiz');

    // Fill first question
    await createQuizPage.fillQuestion(0, {
      text: 'What planet is closest to the Sun?',
      optionA: 'Venus',
      optionB: 'Mercury',
      optionC: 'Earth',
      optionD: 'Mars',
      correctAnswer: 'B',
      timeLimit: 15,
    });

    // Save and host
    await createQuizPage.saveAndHost();

    // Should navigate to host page
    await expect(page).toHaveURL(/#\/host\//);
    await expect(page.getByText('Room not found')).not.toBeVisible();
  });

  // ─── Multi Question Quiz ────────────────────────────────────────────────────

  test('should create a quiz with multiple questions', async ({ createQuizPage, page }) => {
    // Fill quiz title
    await createQuizPage.fillQuizTitle('History Quiz');

    // Fill first question
    await createQuizPage.fillQuestion(0, {
      text: 'Who was the first US President?',
      optionA: 'Abraham Lincoln',
      optionB: 'George Washington',
      optionC: 'Thomas Jefferson',
      optionD: 'John Adams',
      correctAnswer: 'B',
      timeLimit: 20,
    });

    // Add a second question
    await createQuizPage.addQuestion();

    // Fill second question
    await createQuizPage.fillQuestion(1, {
      text: 'In which year did World War II end?',
      optionA: '1943',
      optionB: '1944',
      optionC: '1945',
      optionD: '1946',
      correctAnswer: 'C',
      timeLimit: 30,
    });

    // Save the quiz
    await createQuizPage.saveQuiz();

    // Should navigate away from create page
    await expect(page).not.toHaveURL(/#\/create/);
  });

  test('should add a new question block when clicking Add Question', async ({ createQuizPage }) => {
    // Initially only 1 question block
    await expect(createQuizPage.questionTextAt(0)).toBeVisible();

    // Add a second question
    await createQuizPage.addQuestion();

    // Second question block should now be visible
    await expect(createQuizPage.questionTextAt(1)).toBeVisible();
  });

  // ─── Navigation ─────────────────────────────────────────────────────────────

  test('should go back home when Cancel is clicked', async ({ createQuizPage, page }) => {
    await createQuizPage.fillQuizTitle('Cancelled Quiz');
    await createQuizPage.cancel();

    // Should navigate away from create page
    await expect(page).not.toHaveURL(/#\/create/);
  });

  test('should go back home when Home button is clicked', async ({ createQuizPage, page }) => {
    await createQuizPage.goHome();
    await expect(page).toHaveURL(/#\//);
  });

  // ─── Default Values ──────────────────────────────────────────────────────────

  test('should have default time limit of 20 seconds', async ({ createQuizPage }) => {
    await expect(createQuizPage.timeLimitAt(0)).toHaveValue('20');
  });

  // ─── End to End Flow ─────────────────────────────────────────────────────────

  test('should create quiz, save it, and verify it appears in My Quizzes', async ({ createQuizPage, myQuizzesPage }) => {
    // Create the quiz
    await createQuizPage.fillQuizTitle('My Verified Quiz');

    await createQuizPage.fillQuestion(0, {
      text: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctAnswer: 'B',
      timeLimit: 10,
    });

    await createQuizPage.saveQuiz();

    // Navigate to My Quizzes
    await myQuizzesPage.goto();

    // Quiz should appear in the list
    await expect(myQuizzesPage.quizCardByTitle('My Verified Quiz')).toBeVisible();
  });

});
