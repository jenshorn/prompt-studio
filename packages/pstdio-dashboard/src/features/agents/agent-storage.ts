const ONBOARDING_KEY = "onboarding-complete";

export const isOnboardingComplete = () => {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
};

export const setOnboardingComplete = () => {
  localStorage.setItem(ONBOARDING_KEY, "true");
};
