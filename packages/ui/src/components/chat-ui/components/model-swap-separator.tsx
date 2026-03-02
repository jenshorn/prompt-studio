import { HStack, Separator, Text } from "@chakra-ui/react";

export interface ModelSwapSeparatorProps {
  fromModel: string;
  toModel: string;
}

export const ModelSwapSeparator = (props: ModelSwapSeparatorProps) => {
  const { fromModel, toModel } = props;

  return (
    <HStack width="full" gap="xs" py="xs" align="center">
      <Separator flex="1" variant="dashed" />
      <Text textStyle="label/XS/regular" color="fg.muted" textAlign="center" flexShrink="0">
        Model changed from {fromModel} to {toModel}.
      </Text>
      <Separator flex="1" variant="dashed" />
    </HStack>
  );
};
