import { AppText } from "@/presentation/components/AppText";
import { Avatar, AvatarFallbackText } from "@/presentation/components/gluestack-ui/avatar";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { TableRow } from "@/presentation/components/gluestack-ui/table";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";

import AddressesTableRowMenu from "./AddressesTableRowMenu";

import type useAddressesRow from "@mainh/useAddressesRow";
import type { AddressRow } from "@mainh/useAddressesRow";

type AddressesTableRowProps = {
  row: AddressRow;
  refetchAddresses: ReturnType<typeof useAddressesRow>["refetch"];
};

const AddressesTableRow = (props: AddressesTableRowProps) => {
  const { row, refetchAddresses } = props;

  const tw = useTw();

  return (
    <TableRow className={cn("w-full", tw.py(3))}>
      <HStack className={cn("w-full items-center", tw.gapX(4))}>
        <Avatar size={tw.input("md")} className={tw.mx(2)}>
          <AvatarFallbackText>{row.name}</AvatarFallbackText>
        </Avatar>

        <VStack className={cn("flex-1", tw.gapY(1))}>
          <AppText t="lg" oneLine className="font-bold w-full">
            {row.name}
          </AppText>

          <AppText t="md" oneLine className="font-bold text-secondary-500 w-full">
            {row.address}
          </AppText>
        </VStack>

        <VStack className="shrink-0">
          <AddressesTableRowMenu row={row} refetchAddresses={refetchAddresses} />
        </VStack>
      </HStack>
    </TableRow>
  );
};

export default AddressesTableRow;
