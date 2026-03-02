import { Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { Link } from "gatsby";

interface LinkGroupProps {
  title: string;
  items: { item: string; url: string }[];
}

export const LinkGroup = (props: LinkGroupProps) => {
  const { title, items } = props;

  const isExternalUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://");

  return (
    <Stack gap="1rem">
      <Text textStyle="paragraph/L/regular" color="foreground.secondary">
        {title}
      </Text>
      {items.map((item) =>
        isExternalUrl(item.url) ? (
          <ChakraLink
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            textStyle="paragraph/L/regular"
            _hover={{ textDecoration: "underline" }}
          >
            {item.item}
          </ChakraLink>
        ) : (
          <Link key={item.url} to={item.url}>
            <Text textStyle="paragraph/L/regular" _hover={{ textDecoration: "underline" }}>
              {item.item}
            </Text>
          </Link>
        ),
      )}
    </Stack>
  );
};
