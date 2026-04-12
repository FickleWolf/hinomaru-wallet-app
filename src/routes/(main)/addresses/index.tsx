import { useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useMemo } from "react";

import { AppText } from "@/presentation/components/AppText";
import { IconButton } from "@/presentation/components/Button";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import Searcher from "@/presentation/components/Searcher";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { theme } from "@/presentation/styles/theme";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";
import useAddressesRow from "@mainh/useAddressesRow";

import AddressMutateField from "../_components/addresses/AddressMutateField";
import ScreenContainer from "../_components/ScreenContainer";

import AddressesMine from "./_components/AddressesMine";
import AddressesTable from "./_components/AddressesTable";

import type { Address } from "viem";

const AddressesScreen = () => {
  const tw = useTw();
  const [isCreating, setIsCreating] = useBoolean(false);
  const params = useLocalSearchParams<{ address?: Address; name?: string }>();

  const { currentWalletRow, addressRows, searchTextRef, isError, handleChangeSearchText, refetch } = useAddressesRow();

  const myAddressRows = useMemo(() => addressRows?.filter(a => a.isMine), [addressRows]);
  const otherAddressRows = useMemo(() => addressRows?.filter(a => !a.isMine), [addressRows]);

  useEffect(() => {
    if (!!params.address && !!params.name) setIsCreating.on();
  }, [params.address, params.name, setIsCreating]);

  return (
    <ScreenContainer appBarProps={{ title: "アドレス帳" }} className="bg-white rounded-t-2xl">
      <VStack className={cn(tw.p(3), tw.gapY(4), "flex-1")}>
        <Searcher
          inputRef={searchTextRef}
          handleChange={handleChangeSearchText}
          componetProps={{
            className: cn("w-full", tw.mt(3))
          }}
        />
        <AddressesMine address={currentWalletRow.address} name={currentWalletRow.name} refetchAddresses={refetch} />
        <VStack className={cn("flex-1", tw.pb(8), tw.gapY(4))}>
          <VStack className={tw.h(52)}>
            <HStack className="items-center justify-between">
              <AppText className="font-bold text-secondary-500">自分のウォレット</AppText>
            </HStack>
            <AddressesTable rows={myAddressRows} isError={isError} refetchAddresses={refetch} />
          </VStack>
          <VStack className="flex-1">
            <HStack className="items-center justify-between">
              <AppText className="font-bold text-secondary-500">すべてのアドレス</AppText>
              <IconButton
                action="default"
                iconSize={tw.scaleNum(28)}
                icon={Plus}
                iconColor={theme.colors.secondary[700]}
                onPress={setIsCreating.on}
              />
            </HStack>
            <AddressesTable rows={otherAddressRows} isError={isError} refetchAddresses={refetch} />
          </VStack>
        </VStack>
      </VStack>

      <AddressMutateField
        mode="create"
        initName={params.name}
        initAddress={params.address}
        refetch={refetch}
        componentProps={{ title: "新規アドレス作成", size: "lg", isOpen: isCreating, onClose: setIsCreating.off }}
      />
    </ScreenContainer>
  );
};

export default AddressesScreen;
