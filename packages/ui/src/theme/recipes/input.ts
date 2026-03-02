import { defineRecipe } from "@chakra-ui/react";

export const inputRecipe = defineRecipe({
  base: {
    px: "sm",
    borderRadius: "sm",
    border: "1px solid",
    transition: "border-color 0.2s ease-in-out",
    bg: "bg",
    color: "fg",
    borderColor: "border.muted",
    _hover: { borderColor: "border" },
    _active: { borderColor: "blue.border" },
    _focus: { borderColor: "blue.border" },
    _focusVisible: { borderColor: "blue.border" },
    _placeholder: { color: "fg.subtle" },
  },
  variants: {
    size: {
      sm: {
        h: "2rem",
      },
    },
  },
});
