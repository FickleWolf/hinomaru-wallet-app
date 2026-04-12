import { useStore } from "@tanstack/react-form";
import { useCallback, useState } from "react";
import { Pressable } from "react-native";

import { AppText } from "@/presentation/components/AppText";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";
import useAddressesRow from "@mainh/useAddressesRow";

import useTransferForm from "../../_hooks/useTransferForm";

import TransferRecipientField from "./TransferRecipientField";

import type { Address } from "viem";

const TransferRecipient = () => {
  const tw = useTw();
  const transferForm = useTransferForm();

  const { form } = transferForm;
  const [isEditing, setIsEditing] = useBoolean(false);
  const [prevValue, setPrevValue] = useState<string>("");

  const useAddressesRowResult = useAddressesRow();
  const { addressToName } = useAddressesRowResult;

  const recipient = useStore(form.baseStore, s => s.values.recipient);

  const handleEdit = useCallback(() => {
    setPrevValue(recipient);
    setIsEditing.on();
  }, [recipient, setIsEditing]);

  return (
    <>
      <HStack
        className={cn(
          "w-full",
          tw.px(4),
          tw.py(3),
          tw.h(24),
          "bg-white",
          "items-center",
          "justify-between",
          tw.gapX(10)
        )}
      >
        <AppText t="lg" className="font-bold text-secondary-700">
          振込先
        </AppText>
        <Pressable className="flex-1" onPress={handleEdit}>
          {(isEditing && prevValue) || (!isEditing && recipient) ? (
            <VStack className={tw.gapY(2)}>
              {addressToName[(isEditing ? prevValue : recipient).toLowerCase()] && (
                <AppText t="lg" oneLine ellipsizeMode="middle" className="font-bold text-right">
                  {addressToName[(isEditing ? prevValue : recipient).toLowerCase()]}
                </AppText>
              )}
              <AppText t="lg" oneLine ellipsizeMode="middle" className="font-bold text-right text-secondary-600">
                {(isEditing ? prevValue : recipient) as Address}
              </AppText>
            </VStack>
          ) : (
            <AppText t="lg" className="text-primary-600 font-bold text-center">
              振込先を入力
            </AppText>
          )}
        </Pressable>
      </HStack>
      <TransferRecipientField
        prevValue={prevValue}
        transferForm={transferForm}
        useAddressesRowResult={useAddressesRowResult}
        componentProps={{
          title: "宛先を入力",
          size: "lg",
          isOpen: isEditing,
          onClose: setIsEditing.off
        }}
      />
    </>
  );
};

export default TransferRecipient;
