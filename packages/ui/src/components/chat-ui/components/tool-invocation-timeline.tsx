import { buildTimelineDocFromInvocations } from "../tool-rendering";
import type { ToolPart } from "./message-types";
import { TimelineFromJSON } from "./timeline";

export interface ToolInvocationTimelineProps {
  invocations: ToolPart[];
  labeledBlocks?: boolean;
  onOpenFile?: (filePath: string) => void;
}

export function ToolInvocationTimeline(props: ToolInvocationTimelineProps) {
  const { invocations, labeledBlocks, onOpenFile } = props;
  const data = buildTimelineDocFromInvocations(invocations, { labeledBlocks });

  return <TimelineFromJSON data={data} onOpenFile={onOpenFile} />;
}
