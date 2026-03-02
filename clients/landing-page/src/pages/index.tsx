import { Box, Container, Heading, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import type { HeadFC } from "gatsby";
import { useEffect, useRef, useState } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { SEO } from "@/components/seo";
import { CopyCommandIcon } from "../components/copy-command-icon";
import { createCopyFeedbackController } from "../utils/copy-feedback";

const command = "npx pstdio";
const githubUrl = "https://github.com/pufflyai/prompt-studio";

const IndexPage = () => {
  const [isCopied, setIsCopied] = useState(false);
  const copyFeedbackControllerRef = useRef<ReturnType<typeof createCopyFeedbackController> | null>(null);

  if (!copyFeedbackControllerRef.current) {
    copyFeedbackControllerRef.current = createCopyFeedbackController(setIsCopied);
  }

  const copyFeedbackController = copyFeedbackControllerRef.current;

  useEffect(() => {
    return () => {
      copyFeedbackController.dispose();
    };
  }, [copyFeedbackController]);

  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText(command);
    copyFeedbackController.markCopied();
  };

  return (
    <Box minH="100vh" bg="bg" color="fg" display="flex" flexDirection="column">
      <Header />
      <Box as="main" flex="1" display="flex">
        <Container maxW="4xl" py={{ base: "20", md: "28" }} flex="1" display="flex">
          <Stack gap="10" align="center" justify="center" textAlign="center" width="100%">
            <Heading as="h1" textStyle="heading/XL" maxW="4xl">
              A task manager for your coding agents.
            </Heading>
            <HStack px="lg" py="xs" rounded="sm" borderWidth="1px" borderColor="border" bg="bg.subtle">
              <Text as="code" fontFamily="mono">
                {command}
              </Text>
              <IconButton aria-label="Copy command" variant="ghost" size="sm" onClick={handleCopyCommand}>
                <CopyCommandIcon isCopied={isCopied} />
              </IconButton>
            </HStack>
          </Stack>
        </Container>
      </Box>
      <Footer
        links={[
          {
            title: "",
            list: [{ item: "GitHub", url: githubUrl }],
          },
        ]}
      />
    </Box>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <SEO />;
