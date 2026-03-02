import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useState } from "react";
import { AttachmentList } from "./attachment-list";
import { ChatInput } from "./chat-input";

const meta: Meta<typeof ChatInput> = {
  title: "Chat UI/Chat Input",
  component: ChatInput,
  parameters: {
    layout: "centered",
    actions: { argTypesRegex: "^on(?!Change)[A-Z].*" },
  },
};
export default meta;

type Story = StoryObj<typeof ChatInput>;
type ChatInputProps = ComponentProps<typeof ChatInput>;

const initialState = JSON.stringify(
  {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: "",
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  },
  null,
  2,
);

export const Default: Story = {
  args: {
    defaultState: initialState,
    placeholder: "Ask me something...",
    onSubmit: (text: string, attachments: string[]) => {
      console.log("Submitted text:", text);
      if (attachments.length > 0) {
        console.log("Submitted attachments:", attachments);
      }
      alert(`Submitted: ${text}${attachments.length > 0 ? ` with ${attachments.length} attachments` : ""}`);
    },
  },
};

function WithAttachmentsRenderer(props: ChatInputProps) {
  const { attachedResources: initialAttachedResources = [], onClearAttachments, ...rest } = props;
  const [attachedResources, setAttachedResources] = useState<string[]>(initialAttachedResources);

  const attachmentList = (
    <AttachmentList
      attachments={attachedResources}
      onSelect={(resourceId) => console.log("Selected:", resourceId)}
      onRemove={(resourceId) => {
        setAttachedResources((prev) => prev.filter((id) => id !== resourceId));
      }}
    />
  );

  return (
    <ChatInput
      {...rest}
      attachedResources={attachedResources}
      attachmentList={attachmentList}
      onClearAttachments={() => {
        setAttachedResources([]);
        onClearAttachments?.();
      }}
    />
  );
}

export const WithAttachments: Story = {
  render: (args) => {
    const rendererArgs: ChatInputProps = {
      ...(args ?? {}),
      defaultState: args?.defaultState ?? initialState,
      attachedResources: args?.attachedResources ?? [],
    };

    return <WithAttachmentsRenderer {...rendererArgs} />;
  },
  args: {
    defaultState: initialState,
    placeholder: "Summarize the attached files...",
    attachedResources: ["workspace/customer-data.csv", "workspace/analysis-report.md"],
    onSubmit: (text: string, attachments: string[]) => {
      console.log("Submitted text:", text);
      console.log("Submitted attachments:", attachments);
      alert(`Submitted: ${text}${attachments.length > 0 ? ` with ${attachments.length} attachments` : ""}`);
    },
  },
};
