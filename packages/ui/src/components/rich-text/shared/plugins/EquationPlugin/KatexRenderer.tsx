import "katex/dist/katex.css";

import katex from "katex";
import { useEffect, useRef } from "react";

export default function KatexRenderer({
  equation,
  inline,
}: Readonly<{
  equation: string;
  inline: boolean;
}>) {
  const katexElementRef = useRef(null);

  useEffect(() => {
    const katexElement = katexElementRef.current;

    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: !inline, // true === block display //
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation, inline]);

  return (
    // We use an empty image tag either side to ensure Android doesn't try and compose from the
    // inner text from Katex. There didn't seem to be any other way of making this work,
    // without having a physical space.
    <>
      <img src="#" alt="" />
      <span ref={katexElementRef} />
      <img src="#" alt="" />
    </>
  );
}
