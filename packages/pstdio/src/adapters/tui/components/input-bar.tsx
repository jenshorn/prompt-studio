import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface InputBarProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function InputBar({ label, value, onChange, onSubmit }: InputBarProps) {
  return (
    <Box>
      <Text backgroundColor="green" color="white" bold>
        {` ${label} `}
      </Text>

      <Text> </Text>

      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}
