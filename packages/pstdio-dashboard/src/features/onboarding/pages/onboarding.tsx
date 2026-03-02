import { ContentPlaceholder, ContentPlaceholderLabel } from "@pstdio/ui";
import { useNavigate } from "@tanstack/react-router";
import { setOnboardingComplete } from "@/features/agents/agent-storage";

export const Onboarding = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    setOnboardingComplete();
    navigate({ to: "/projects" });
  };

  return (
    <ContentPlaceholder onClick={handleComplete} cursor="pointer">
      <ContentPlaceholderLabel>Onboarding — click to complete</ContentPlaceholderLabel>
    </ContentPlaceholder>
  );
};
