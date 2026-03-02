import type { GatsbyBrowser } from "gatsby";
import { RootProvider } from "@/components/root-provider";

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => (
  <RootProvider>{element}</RootProvider>
);
