import type { ReactNode } from "react";

export const WorkspaceProvider = (props: { children: ReactNode }) => {
  return <>{props.children}</>;
};
