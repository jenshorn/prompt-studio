import { Button, Drawer, IconButton, Spacer, Stack } from "@chakra-ui/react";
import { Link } from "gatsby";
import { useState } from "react";
import { TextLogo } from "./text-logo";

interface MobileMenuItem {
  id?: string;
  label: string;
  url: string;
}

interface MobileDrawerProps {
  menuItems: MobileMenuItem[];
}

const toPagePath = (url: string) => {
  if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `/${url}`;
};

export const MobileDrawer = (props: MobileDrawerProps) => {
  const { menuItems } = props;
  const [open, setOpen] = useState(false);

  const onToggle = () => {
    setOpen((previous) => !previous);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Spacer display={["inline-flex", "inline-flex", "inline-flex", "none"]} />
      <IconButton
        mt="-2px"
        display={["inline-flex", "inline-flex", "inline-flex", "none"]}
        onClick={onToggle}
        aria-label="Toggle menu"
        variant="ghost"
        size="lg"
      >
        {open ? "Close" : "Menu"}
      </IconButton>

      <Drawer.Root placement="top" open={open} onOpenChange={(details) => setOpen(details.open)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header px={["1.5rem", "3.75rem"]}>
              <TextLogo />
              <Spacer />
              <IconButton
                mt="-2px"
                display={["inline-flex", "inline-flex", "inline-flex", "none"]}
                onClick={onToggle}
                aria-label="Toggle menu"
                variant="ghost"
                size="lg"
              >
                Close
              </IconButton>
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap="1.5rem" p="2">
                {menuItems.map((item, index) => (
                  <Link key={item.id ?? index} to={toPagePath(item.url)}>
                    <Button onClick={onClose} fontWeight="normal" variant="ghost" justifyContent="flex-start">
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
};
