import { ChakraProvider } from "@chakra-ui/react";
import { applyThemePreference, getInitialThemePreference, psTheme, ThemePreferenceProvider } from "@pstdio/ui";
import type { ReactNode } from "react";

const initialThemePreference = getInitialThemePreference();

applyThemePreference(initialThemePreference);

interface RootProviderProps {
  children: ReactNode;
}

export const RootProvider = (props: RootProviderProps) => {
  const { children } = props;

  return (
    <ThemePreferenceProvider initialPreference={initialThemePreference}>
      <ChakraProvider value={psTheme}>{children}</ChakraProvider>
    </ThemePreferenceProvider>
  );
};
