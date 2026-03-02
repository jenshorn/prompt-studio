import { defineSlotRecipe } from "@chakra-ui/react";
import { popoverAnatomy } from "@chakra-ui/react/anatomy";

export const popoverRecipe = defineSlotRecipe({
  slots: popoverAnatomy.keys(),
  base: {
    positioner: {
      _focus: { boxShadow: "none !important" },
    },
    closeTrigger: {
      textStyle: "label/M/medium",
      color: "fg",
    },
    arrow: {
      bg: "background-primary !important",
      borderColor: "button-secondary-stroke",
    },
    content: {
      gap: "8px",
      py: "xs",
      borderRadius: "12px",
      bg: "bg",
      borderColor: "border",
      _focus: { boxShadow: "none !important" },
    },
    title: {
      borderBottom: "none",
      textStyle: "label/M/medium",
      bg: "bg",
    },
    body: { textStyle: "primary" },
    footer: {},
  },
  variants: {
    variant: {
      responsive: {
        content: { width: "unset" },
      },
    },
    size: {
      "2xl": {
        content: { width: "2xl" },
      },
    },
  },
});
