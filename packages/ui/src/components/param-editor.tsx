import { Separator, Stack } from "@chakra-ui/react";
import { Fragment } from "react";
import type { InputGroup, Param, ParamValue, ParamValueMap } from "./param-editor.types";
import { ColorInput } from "./param-editor-color-input";
import { DateInput } from "./param-editor-date-input";
import { InputGroupComponent } from "./param-editor-input-group";
import { NumberInput } from "./param-editor-number-input";
import { SelectionInput } from "./param-editor-selection-input";
import { TextInput } from "./param-editor-text-input";

export interface ParamEditorProps {
  params?: Param[];
  groups?: InputGroup[];
  defaultValues: ParamValueMap;
  onChange: (id: string, value: ParamValue) => void;
  readOnly?: boolean;
  fullWidth?: boolean;
}

export const ParamEditor = (props: ParamEditorProps) => {
  const { params = [], groups = [], defaultValues, onChange, readOnly, fullWidth = false } = props;

  const renderParam = (param: Param) => {
    if (param.type === "number") {
      const defaultValue =
        defaultValues[param.id] === undefined ? (param.defaultValue ?? param.min) : (defaultValues[param.id] as number);
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
        defaultValues[param.id] === undefined ? (param.defaultValue ?? param.min) : (defaultValues[param.id] as string);
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
    <Stack flex="1" maxW="full" gap="md">
      {/* Render standalone params */}
      {params.map(renderParam)}

      {/* Add separator between standalone params and groups if both exist */}
      {params.length > 0 && groups.length > 0 && <Separator borderColor="border.secondary" />}

      {/* Render groups with separators */}
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          <InputGroupComponent
            group={group}
            defaultValues={defaultValues}
            onChange={onChange}
            readOnly={readOnly}
            fullWidth={fullWidth}
          />
          {/* Add divider after each group except the last one */}
          {index < groups.length - 1 && <Separator borderColor="border.secondary" />}
        </Fragment>
      ))}
    </Stack>
  );
};
