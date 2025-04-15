export const isFirstTimeUser = (): boolean => {
  return !localStorage.getItem('userOnboarded');
};

export const setUserOnboarded = (answers: Record<string, string>): void => {
  localStorage.setItem('userOnboarded', 'true');
  localStorage.setItem('userAnswers', JSON.stringify(answers));
};

export const getUserAnswers = (): Record<string, string> | null => {
  const answers = localStorage.getItem('userAnswers');
  return answers ? JSON.parse(answers) : null;
};
