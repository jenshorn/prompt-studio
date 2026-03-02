/**
 * Injects CSS for Yjs awareness cursor rendering in the collaborative editor.
 * @lexical/yjs injects cursor elements with data-* attributes; this styles them.
 */
export function AwarenessCursorsCSS() {
  return (
    <style>
      {`
        .collaboration-cursor-container {
          position: relative;
          display: inline;
        }

        .collaboration-cursor-caret {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          pointer-events: none;
        }

        .collaboration-cursor-label {
          position: absolute;
          top: -18px;
          left: -2px;
          padding: 1px 6px;
          font-size: 11px;
          font-weight: 600;
          line-height: 16px;
          white-space: nowrap;
          border-radius: 4px 4px 4px 0;
          color: #fff;
          pointer-events: none;
          user-select: none;
        }

        .collaboration-cursor-selection {
          position: absolute;
          pointer-events: none;
          opacity: 0.25;
        }
      `}
    </style>
  );
}
