import { useCallback } from "react";

import { BottomActionSheet } from "@/presentation/components/BottomActionSheet";
import { useUpdateAddress } from "@/presentation/hooks/mutations/useUpdateAddress";

import AddressesMineEditForm from "./AddressesMineEditForm";

import type useAddressesRow from "@mainh/useAddressesRow";
import type { Address } from "viem";

type AddressesMineEditFieldProps = {
  address: Address;
  name: string;
  componentProps: Omit<React.ComponentProps<typeof BottomActionSheet>, "children">;
  refetchAddresses: ReturnType<typeof useAddressesRow>["refetch"];
};

const AddressesMineEditField = (props: AddressesMineEditFieldProps) => {
  const { address, name, componentProps, refetchAddresses } = props;
  const { mutateAsync: updateAddress } = useUpdateAddress();

  const handleEdit = useCallback(
    async (name: string) => {
      await updateAddress({ address, name });
      await refetchAddresses();
    },
    [address, refetchAddresses, updateAddress]
  );

  return (
    <BottomActionSheet {...componentProps}>
      <AddressesMineEditForm initName={name} onClose={componentProps.onClose} onEdit={handleEdit} />
    </BottomActionSheet>
  );
};

export default AddressesMineEditField;
