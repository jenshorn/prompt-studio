import type { GatsbySSR } from "gatsby";
import { RootProvider } from "@/components/root-provider";

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => <RootProvider>{element}</RootProvider>;
