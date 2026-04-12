import { useCallback } from "react";
import { ScrollView } from "react-native";

import { AppText } from "@/presentation/components/AppText";
import BackDrop from "@/presentation/components/BackDrop";
import { BottomActionSheet } from "@/presentation/components/BottomActionSheet";
import { ContainButton, SubContainButton } from "@/presentation/components/Button";
import { AlertDialog } from "@/presentation/components/Dialog";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { ErrorText, InfoText } from "@/presentation/components/Text";
import { useTransferToken } from "@/presentation/hooks/mutations/useTransferToken";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useSafeCloseToHome } from "@/presentation/hooks/useSafeCloseToHome";
import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";
import { useTw } from "@/presentation/styles/tw";
import type { Token } from "@/registries/ChainTokenRegistry";
import { cn } from "@/shared/helpers/cn";
import ConfirmAmount from "@mainc/confirm/ConfirmAmount";
import ConfirmRecipient from "@mainc/confirm/ConfirmRecipient";

import type { Address } from "viem";

type TransferConfirmProps = {
  name: string | undefined;
  recipient: Address;
  amount: number;
  sendToken: Token;
  feeToken: Token;
  feeDisplyValue: number;
  componentProps: Omit<React.ComponentProps<typeof BottomActionSheet>, "children">;
};

const TransferConfirm = (props: TransferConfirmProps) => {
  const tw = useTw();
  const { name, recipient, amount, sendToken, feeToken, feeDisplyValue, componentProps } = props;

  const { safeClose } = useSafeCloseToHome();
  const { account, walletClient } = useShackwWalletContext();
  const [isTransferring, setIsTransferring] = useBoolean(false);

  const { mutate, error, isSuccess } = useTransferToken({ onSettled: setIsTransferring.off });

  const handleTransfer = useCallback(async () => {
    if (!account || !walletClient) return;
    setIsTransferring.on();
    mutate({
      account,
      client: walletClient,
      token: sendToken,
      feeToken: feeToken as Token,
      amountDisplayValue: Number(amount),
      recipient: recipient as Address
    });
  }, [account, amount, walletClient, feeToken, mutate, recipient, sendToken, setIsTransferring]);

  const handleCloseSuccess = useCallback(() => {
    componentProps.onClose();
    setIsTransferring.off();
    safeClose();
  }, [safeClose, componentProps, setIsTransferring]);

  return (
    <>
      <BottomActionSheet {...componentProps}>
        <VStack className={cn("w-full", "h-full", "justify-between", tw.gapY(7))}>
          <VStack className={cn("w-full", "flex-1", tw.gapY(7))}>
            <AppText t="md" className="text-center font-bold text-secondary-700">
              {"以下の内容で送金します。\n問題なければ送金ボタンを押してください。"}
            </AppText>

            <ScrollView className={cn("w-full", "flex-1")} showsVerticalScrollIndicator={false}>
              <VStack className={cn("w-full", "flex-1", tw.gapY(7))}>
                <ConfirmRecipient title="振込先情報" name={name} address={recipient} />
                <ConfirmAmount
                  title="送金額・手数料"
                  amount={amount}
                  sendToken={sendToken}
                  feeToken={feeToken}
                  feeDisplayValue={feeDisplyValue}
                />
                {error && <ErrorText>{error.message}</ErrorText>}
              </VStack>
            </ScrollView>
          </VStack>

          <HStack className={tw.gapX(4)}>
            <SubContainButton text="戻る" size="lg" className="flex-1" onPress={componentProps.onClose} />
            <ContainButton
              text="送金"
              size="lg"
              className="flex-1"
              onPress={handleTransfer}
              isLoading={isTransferring}
            />
          </HStack>
        </VStack>
      </BottomActionSheet>

      <BackDrop visible={isTransferring} />
      <AlertDialog title="送金完了" isOpen={isSuccess && componentProps.isOpen} onClose={handleCloseSuccess} size="lg">
        <VStack className={cn(tw.py(4), tw.gapY(1))}>
          <InfoText>{`送金が完了しました。`}</InfoText>
        </VStack>
      </AlertDialog>
    </>
  );
};

export default TransferConfirm;
