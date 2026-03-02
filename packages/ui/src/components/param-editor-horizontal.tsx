import { HStack, Stack, Text, VStack } from "@chakra-ui/react";
import type { InputGroup, Param, ParamValue, ParamValueMap } from "./param-editor.types";
import { ColorInput } from "./param-editor-color-input";
import { DateInput } from "./param-editor-date-input";
import { HorizontalTextInput } from "./param-editor-horizontal-text-input";
import { NumberInput } from "./param-editor-number-input";
import { SelectionInput } from "./param-editor-selection-input";

export interface ParamEditorHorizontalProps {
  params?: Param[];
  groups?: InputGroup[];
  defaultValues: ParamValueMap;
  onChange: (id: string, value: ParamValue) => void;
  readOnly?: boolean;
  fullWidth?: boolean; // This option doesn't do anything in horizontal mode
}

export const ParamEditorHorizontal = (props: ParamEditorHorizontalProps) => {
  const { params = [], groups = [], defaultValues, onChange, readOnly } = props;

  const renderParam = (param: Param) => {
    if (param.type === "number") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as number);
      return (
        <NumberInput
          hideLabel
          hideSlider
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
          tooltipPlacement="top"
        />
      );
    }

    if (param.type === "text") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string);
      return (
        <HorizontalTextInput
          hideLabel
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          onChange={onChange}
          tooltipPlacement="top"
        />
      );
    }

    if (param.type === "selection") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string | string[]);
      return (
        <SelectionInput
          hideLabel
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          options={param.options}
          onChange={onChange}
          multiSelect={param.multiSelect}
          tooltipPlacement="top"
          placeholder={param.placeholder}
        />
      );
    }

    if (param.type === "date") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string);
      return (
        <DateInput
          hideLabel
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          min={param.min}
          max={param.max}
          onChange={onChange}
          tooltipPlacement="top"
        />
      );
    }

    if (param.type === "color") {
      const defaultValue =
        defaultValues[param.id] === undefined ? param.defaultValue : (defaultValues[param.id] as string);
      return (
        <ColorInput
          hideLabel
          readOnly={readOnly}
          id={param.id}
          key={param.id}
          name={param.name}
          description={param.description || ""}
          defaultValue={defaultValue}
          onChange={onChange}
          tooltipPlacement="top"
        />
      );
    }

    return null;
  };

  return (
    <Stack direction="row" flex="1" maxW="full" gap="sm" flexWrap="wrap">
      {/* Render standalone params */}
      {params.map(renderParam)}

      {/* Render grouped params */}
      {groups.map((group) => (
        <VStack key={group.id} gap="xs" align="start">
          <Text fontSize="sm" fontWeight="medium" color="foreground.secondary">
            {group.title}
          </Text>
          <HStack gap="xs">{group.params.map(renderParam)}</HStack>
        </VStack>
      ))}
    </Stack>
  );
};
