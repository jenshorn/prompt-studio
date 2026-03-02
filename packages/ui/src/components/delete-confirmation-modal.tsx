import { Button, CloseButton, Dialog, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void | Promise<void>;
  headline?: string;
  notificationText?: string;
  buttonText?: string;
}

export type { DeleteConfirmationModalProps };

export const DeleteConfirmationModal = (props: DeleteConfirmationModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { headline, buttonText, notificationText, onDelete, open, onClose } = props;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await onDelete();
      onClose();
    } catch {
      // Errors surface through parent state.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Text textStyle="heading/M">{headline}</Text>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>{notificationText}</Dialog.Body>
          <Dialog.Footer>
            <Stack direction="row" gap="1">
              <Button onClick={onClose}>Close</Button>
              <Button loading={isDeleting} variant="solid" colorPalette="red" onClick={handleDelete}>
                {buttonText}
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
