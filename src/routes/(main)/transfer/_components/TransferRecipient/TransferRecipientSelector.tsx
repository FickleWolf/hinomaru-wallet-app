import { useCallback } from "react";
import { Pressable, ScrollView } from "react-native";

import { AppText } from "@/presentation/components/AppText";
import { Avatar, AvatarFallbackText } from "@/presentation/components/gluestack-ui/avatar";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { Table, TableBody, TableRow } from "@/presentation/components/gluestack-ui/table";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import Searcher from "@/presentation/components/Searcher";
import TableSuspence from "@/presentation/components/TableSuspence";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";

import type { TransferFormContextType } from "../../_hooks/useTransferForm";
import type useAddressesRow from "@mainh/useAddressesRow";
import type { Address } from "viem";

type TransferRecipientSelectorProps = Pick<
  ReturnType<typeof useAddressesRow>,
  "addressRows" | "searchText" | "searchTextRef" | "isError" | "handleChangeSearchText"
> & { form: TransferFormContextType["form"]; handleClose: () => void };

const TransferRecipientSelector = (props: TransferRecipientSelectorProps) => {
  const tw = useTw();
  const { form, addressRows, searchText, searchTextRef, isError, handleClose, handleChangeSearchText } = props;

  const handleSelect = useCallback(
    (address: Address) => {
      form.setFieldValue("recipient", address);
      handleClose();
    },
    [form, handleClose]
  );

  return (
    <VStack className={cn("w-full", "flex-1", tw.gapY(2))}>
      <Searcher
        defaultValue={searchText}
        inputRef={searchTextRef}
        handleChange={handleChangeSearchText}
        componetProps={{ className: "w-full" }}
      />
      <TableSuspence title="アドレス" rows={addressRows} isError={isError}>
        {rows => (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Table className={cn("w-full", "overflow-y-auto")}>
              <TableBody className="w-full">
                {rows.map(({ name, address }, index) => (
                  <TableRow key={`recipient-${index}`} className={cn("w-full", tw.py(5))}>
                    <Pressable onPress={() => handleSelect(address)} className="flex-1 justify-center">
                      <HStack className={cn("w-full", tw.gapX(1), "items-center")}>
                        <Avatar size={tw.input("md")} className={cn(tw.mx(2))}>
                          <AvatarFallbackText>{name}</AvatarFallbackText>
                        </Avatar>

                        <VStack className={cn("flex-1", "justify-center")}>
                          <AppText t="lg" className="font-bold" oneLine>
                            {name}
                          </AppText>
                          <AppText
                            t="md"
                            oneLine
                            ellipsizeMode="middle"
                            className="font-bold text-secondary-500 flex-shrink"
                          >
                            {address}
                          </AppText>
                        </VStack>
                      </HStack>
                    </Pressable>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollView>
        )}
      </TableSuspence>
    </VStack>
  );
};

export default TransferRecipientSelector;
