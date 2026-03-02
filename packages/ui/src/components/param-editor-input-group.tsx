import { Box, Button, Collapsible, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import type { InputGroup, Param, ParamValue, ParamValueMap } from "./param-editor.types";
import { ColorInput } from "./param-editor-color-input";
import { DateInput } from "./param-editor-date-input";
import { NumberInput } from "./param-editor-number-input";
import { SelectionInput } from "./param-editor-selection-input";
import { TextInput } from "./param-editor-text-input";

interface InputGroupComponentProps {
  group: InputGroup;
  defaultValues: ParamValueMap;
  onChange: (id: string, value: ParamValue) => void;
  readOnly?: boolean;
  fullWidth?: boolean;
}

export const InputGroupComponent = (props: InputGroupComponentProps) => {
  const { group, defaultValues, onChange, readOnly, fullWidth = false } = props;
  const { open, onToggle } = useDisclosure({
    defaultOpen: !group.defaultCollapsed,
  });

  const renderParam = (param: Param) => {
    if (param.type === "number") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as number);
      return (
        <NumberInput
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          min={param.min}
          max={param.max}
          step={param.step}
          onChange={onChange}
          fullWidth={fullWidth}
        />
      );
    }

    if (param.type === "text") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string);
      return (
        <TextInput
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          singleLine={param.singleLine}
          onChange={onChange}
          fullWidth={fullWidth}
        />
      );
    }

    if (param.type === "selection") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string | string[]);
      return (
        <SelectionInput
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          options={param.options}
          onChange={onChange}
          multiSelect={param.multiSelect}
          placeholder={param.placeholder}
          fullWidth={fullWidth}
        />
      );
    }

    if (param.type === "date") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string);
      return (
        <DateInput
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          min={param.min}
          max={param.max}
          onChange={onChange}
          fullWidth={fullWidth}
        />
      );
    }

    if (param.type === "color") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string);
      return (
        <ColorInput
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          onChange={onChange}
          fullWidth={fullWidth}
        />
      );
    }

    return null;
  };

  return (
    <Box>
      {group.collapsible ? (
        <Button variant="ghost" size="xs" onClick={onToggle} pl={0} _hover={{ bg: "transparent" }}>
          <Flex alignItems="center" gap="xs">
            <Text textStyle="label/M/medium">{group.title}</Text>
            {open ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
          </Flex>
        </Button>
      ) : (
        <Text textStyle="label/M/medium">{group.title}</Text>
      )}

      {group.description && (
        <Text textStyle="label/S/regular" color="foreground.secondary" mb="sm">
          {group.description}
        </Text>
      )}

      <Collapsible.Root open={group.collapsible ? open : true}>
        <Collapsible.Content>
          <Stack gap="md">{group.params.map(renderParam)}</Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};
