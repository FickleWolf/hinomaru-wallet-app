import { ScrollView } from "react-native";

import { Table, TableBody } from "@/presentation/components/gluestack-ui/table";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import TableSuspence from "@/presentation/components/TableSuspence";

import AddressesTableRow from "./AddressesTableRow";

import type useAddressesRow from "@mainh/useAddressesRow";
import type { AddressRow } from "@mainh/useAddressesRow";

type AddressesTableProps = {
  rows: AddressRow[] | undefined;
  isError: boolean;
  refetchAddresses: ReturnType<typeof useAddressesRow>["refetch"];
};

const AddressesTable = (props: AddressesTableProps) => {
  const { rows, isError, refetchAddresses } = props;

  return (
    <TableSuspence title="アドレス" rows={rows} isError={isError}>
      {rows => (
        <VStack className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Table className="w-full overflow-y-auto">
              <TableBody className="w-full">
                {rows.map((row, index) => (
                  <AddressesTableRow row={row} refetchAddresses={refetchAddresses} key={`addresses-${index}`} />
                ))}
              </TableBody>
            </Table>
          </ScrollView>
        </VStack>
      )}
    </TableSuspence>
  );
};

export default AddressesTable;
