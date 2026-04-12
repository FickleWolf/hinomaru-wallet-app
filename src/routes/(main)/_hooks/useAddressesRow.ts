import { useCallback, useMemo, useRef, useState } from "react";

import type { AddressModel } from "@/domain/address";
import { useListAddresses } from "@/presentation/hooks/queries/useListAddresses";
import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";

import type { TextInput as RNTextInput } from "react-native";

export type AddressRow = Pick<AddressModel, "address" | "name" | "isMine">;

const useAddressesRow = () => {
  const { account } = useShackwWalletContext();
  const { data: addresses, ...rest } = useListAddresses();

  const searchTextRef = useRef<RNTextInput | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const currentWalletRow = useMemo(() => {
    const mine = addresses && addresses.find(a => a.isMine && a.address === account?.address);

    if (!mine) {
      return { address: account?.address ?? "0x", name: "Mine", isMine: true };
    }

    return { address: mine.address, name: mine.name, isMine: true };
  }, [account?.address, addresses]);

  const addressRows: AddressRow[] | undefined = useMemo(() => {
    if (!addresses) return undefined;

    const excludedCurrent = addresses
      .filter(a => a.address !== account?.address)
      .map(a => ({ address: a.address, name: a.name, isMine: a.isMine }));

    if (!searchText) return excludedCurrent;

    const searchParams = String(searchText)
      .split(/\p{White_Space}+/u)
      .filter(Boolean);
    const searched = excludedCurrent.filter(a => searchParams.some(s => a.name.includes(s) || a.address.includes(s)));

    return searched;
  }, [account?.address, addresses, searchText]);

  const addressToName: Partial<Record<string, string>> = useMemo(() => {
    if (!addresses) return {};

    let result: Record<string, string> = {};
    for (const { address, name } of addresses) result[address] = name;
    return result;
  }, [addresses]);

  const handleChangeSearchText = useCallback((t: string) => {
    searchTextRef?.current?.setNativeProps({ text: t });
    setSearchText(t);
  }, []);

  return {
    currentWalletRow,
    addressRows,
    addressToName,
    searchText,
    searchTextRef,
    handleChangeSearchText,
    ...rest
  };
};

export default useAddressesRow;
