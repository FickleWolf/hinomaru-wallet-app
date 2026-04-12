import { setStringAsync } from "expo-clipboard";
import { Copy, EllipsisVertical, QrCode, SquarePen } from "lucide-react-native";
import { useCallback } from "react";

import { IconButton } from "@/presentation/components/Button";
import { Icon } from "@/presentation/components/gluestack-ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "@/presentation/components/gluestack-ui/menu";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { theme } from "@/presentation/styles/theme";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";
import AddressesDisplayQR from "@mainc/addresses/AddressesDisplayQR";

import AddressesMineEditField from "./AddressesMineEditField";

import type useAddressesRow from "@mainh/useAddressesRow";
import type { Address } from "viem";

type AddressesMineMenuProps = {
  address: Address;
  name: string;
  refetchAddresses: ReturnType<typeof useAddressesRow>["refetch"];
};

const AddressesMineMenu = (props: AddressesMineMenuProps) => {
  const { address, name, refetchAddresses } = props;
  const [isEditing, setIsEditing] = useBoolean(false);
  const [isDisplayQr, setIsDisplayQr] = useBoolean(false);

  const tw = useTw();

  const handleCopy = useCallback(() => {
    setStringAsync(address);
  }, [address]);

  return (
    <>
      <Menu
        placement="left top"
        offset={5}
        className="bg-secondary-50"
        trigger={({ ...triggerProps }) => {
          return (
            <IconButton
              defaultProps={triggerProps}
              action="default"
              className="ml-auto"
              iconSize={tw.scaleNum(25)}
              icon={EllipsisVertical}
              iconColor={theme.colors.secondary[700]}
            />
          );
        }}
      >
        <MenuItem key="Edit Profile" textValue="編集" onPress={setIsEditing.on}>
          <Icon as={SquarePen} size="md" className={tw.mr(2)} />
          <MenuItemLabel className={cn(["font-bold", tw.text("md")])}>編集</MenuItemLabel>
        </MenuItem>
        <MenuItem key="Disply QR" textValue="QRコードを表示" onPress={setIsDisplayQr.on}>
          <Icon as={QrCode} size="md" className={tw.mr(2)} />
          <MenuItemLabel className={cn(["font-bold", tw.text("md")])}>QRコードを表示</MenuItemLabel>
        </MenuItem>
        <MenuItem key="Copy Address" textValue="アドレスをコピー" onPress={handleCopy}>
          <Icon as={Copy} size="md" className={tw.mr(2)} />
          <MenuItemLabel className={cn(["font-bold", tw.text("md")])}>アドレスをコピー</MenuItemLabel>
        </MenuItem>
      </Menu>

      <AddressesMineEditField
        key={`edit-mine:${address}`}
        address={address}
        name={name}
        refetchAddresses={refetchAddresses}
        componentProps={{
          title: "プロフィールの編集",
          size: "lg",
          isOpen: isEditing,
          onClose: setIsEditing.off
        }}
      />

      <AddressesDisplayQR
        key={`qr-mine:${address}`}
        address={address}
        name={name}
        componentProps={{
          title: "プロフィールの共有",
          size: "lg",
          isOpen: isDisplayQr,
          onClose: setIsDisplayQr.off
        }}
      />
    </>
  );
};

export default AddressesMineMenu;
