import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { ReactNode } from "react";
import { Component, useState } from "react";

import KatexRenderer from "./KatexRenderer";

type EquationComponentProps = {
  equation: string;
  inline: boolean;
};

interface EditorErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
}

class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function EquationComponent({ equation, inline }: EquationComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [equationValue, _setEquationValue] = useState(equation);
  return (
    <EditorErrorBoundary onError={(e) => editor._onError(e)}>
      <KatexRenderer equation={equationValue} inline={inline} />
    </EditorErrorBoundary>
  );
}
