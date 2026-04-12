import { useCallback, useState } from "react";

import BackDrop from "@/presentation/components/BackDrop";
import { ActionDialog } from "@/presentation/components/Dialog";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { InfoText, ErrorText } from "@/presentation/components/Text";
import { useDeleteAddress } from "@/presentation/hooks/mutations/useDeleteAddress";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";

import type useAddressesRow from "@mainh/useAddressesRow";
import type { Address } from "viem";

type AddressesTableDeleteDialogProps = {
  address: Address;
  isOpen: boolean;
  handleClose: () => void;
  refetchAddresses: ReturnType<typeof useAddressesRow>["refetch"];
};

const AddressesTableDeleteDialog = (props: AddressesTableDeleteDialogProps) => {
  const { address, isOpen, handleClose, refetchAddresses } = props;
  const { mutateAsync: deleteAddress } = useDeleteAddress();

  const tw = useTw();

  const [isDeleting, setIsDeleting] = useBoolean(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting.on();
      await deleteAddress(address);
      await refetchAddresses();

      setIsDeleting.off();
      handleClose();
    } catch (error) {
      setIsDeleting.off();
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("アドレスの削除中に不明なエラーが発生しました。");
    }
  }, [address, deleteAddress, handleClose, refetchAddresses, setIsDeleting]);

  return (
    <>
      <BackDrop visible={isDeleting} />
      <ActionDialog
        title="アドレスの削除"
        action="secondary"
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        buttonProps={{ text: "削除", isLoading: isDeleting, onPress: handleDelete }}
      >
        <VStack className={cn(tw.py(4), tw.gapY(1))}>
          {!error ? (
            <InfoText>{`削除したアドレスを復元することはできません。`}</InfoText>
          ) : (
            <ErrorText>{error}</ErrorText>
          )}
        </VStack>
      </ActionDialog>
    </>
  );
};

export default AddressesTableDeleteDialog;
