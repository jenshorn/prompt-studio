import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { Link } from "gatsby";
import { LinkGroup } from "./link-group";
import { StockholmIcon } from "./stockholm-icon";

interface FooterLinkGroup {
  title: string;
  list: { item: string; url: string }[];
}

interface FooterAction {
  label: string;
  url: string;
}

interface FooterProps {
  actions?: FooterAction[];
  title?: string;
  links: FooterLinkGroup[];
}

export const Footer = (props: FooterProps) => {
  const { actions = [], links, title } = props;
  const showTopSection = Boolean(title) || actions.length > 0;

  return (
    <Flex as="footer" id="footer" justifyContent="center" position="relative" direction="column" zIndex="1">
      {showTopSection ? (
        <Flex
          bg="white"
          py="4.5rem"
          px={["1.5rem", "3.5rem", "5rem", "8rem", "12rem"]}
          direction="column"
          width="100%"
          gap="2.5rem"
        >
          {title ? (
            <Text width="100%" maxWidth="28.125rem" textStyle="heading/L">
              {title}
            </Text>
          ) : null}
          {actions.length > 0 ? (
            <Stack direction="row" flexWrap="wrap">
              {actions.map((action) => (
                <Link key={action.label} to={action.url}>
                  <Button variant="solid">{action.label}</Button>
                </Link>
              ))}
            </Stack>
          ) : null}
        </Flex>
      ) : null}

      <Flex bg="white" pb="4.5rem" px={["1.5rem", "3.5rem", "5rem", "8rem", "12rem"]}>
        <Stack gap="2.5rem" direction={["column", "row"]} justifyContent="space-between" width="100%" flexWrap="wrap">
          {links.map((link) => (
            <LinkGroup key={link.title} title={link.title} items={link.list} />
          ))}
          <Flex mt={["2.5rem", "2.5rem", "0"]} gap="2rem" alignSelf="flex-end" flexWrap="wrap">
            <Flex width="3rem">
              <StockholmIcon />
            </Flex>
            <Box>
              <Text fontSize={["md", "lg"]}>© Pufflig AB.</Text>
              <Text fontSize={["md", "lg"]} as="span" fontWeight="500">
                Stockholm, {new Date().getFullYear()}
              </Text>
            </Box>
          </Flex>
        </Stack>
      </Flex>
    </Flex>
  );
};

export default Footer;
