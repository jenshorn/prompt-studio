import { Button, Container, Stack } from "@chakra-ui/react";
import { EmptyState } from "@pstdio/ui";
import { type HeadFC, Link, type PageProps } from "gatsby";

const NotFoundPage = (_props: PageProps) => (
  <Container as="main" maxW="3xl" py={{ base: "20", md: "28" }}>
    <Stack gap="6">
      <EmptyState
        title="Page not found"
        description="The page you requested does not exist or has moved to a new path."
        borderWidth="1px"
        borderColor="border"
        rounded="lg"
        p="8"
      />
      <Button asChild alignSelf="start" variant="outline" colorPalette="teal">
        <Link to="/">Go back home</Link>
      </Button>
    </Stack>
  </Container>
);

export default NotFoundPage;

export const Head: HeadFC = () => <title>Not found</title>;
