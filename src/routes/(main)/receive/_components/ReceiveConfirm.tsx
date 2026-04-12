import { useRef, useCallback } from "react";
import { ScrollView } from "react-native";

import { BottomActionSheet } from "@/presentation/components/BottomActionSheet";
import { ContainButton, SubContainButton } from "@/presentation/components/Button";
import { AlertDialog } from "@/presentation/components/Dialog";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import type { QRCodeHandle } from "@/presentation/components/QRCode";
import QRCode from "@/presentation/components/QRCode";
import { ErrorText } from "@/presentation/components/Text";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useWalletPreferencesContext } from "@/presentation/providers/WalletPreferencesProvider";
import { useTw } from "@/presentation/styles/tw";
import type { Token } from "@/registries/ChainTokenRegistry";
import { cn } from "@/shared/helpers/cn";
import ConfirmAmount from "@mainc/confirm/ConfirmAmount";

import type { Address } from "viem";

type ReceiveConfirmProps = {
  recipient: Address;
  amount: number;
  sendToken: Token;
  feeToken: Token;
  feeDisplayValue: number;
  componentProps: Omit<React.ComponentProps<typeof BottomActionSheet>, "children">;
};

const ReceiveConfirm = (props: ReceiveConfirmProps) => {
  const tw = useTw();
  const { recipient, amount, sendToken, feeToken, feeDisplayValue, componentProps } = props;

  const { currentChain: chain } = useWalletPreferencesContext();
  const [isShowErrorDialog, setIsShowErrorDialog] = useBoolean(false);

  const qrCodeRef = useRef<QRCodeHandle | null>(null);

  const handleShareInvoice = useCallback(async () => {
    try {
      await qrCodeRef.current?.handleShare();
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <>
      <BottomActionSheet {...componentProps}>
        <VStack className={cn("w-full", "flex-1", tw.gapY(7))}>
          <ScrollView className={cn("w-full", "flex-1")} showsVerticalScrollIndicator={false}>
            <VStack className={cn("w-full", "flex-1", "items-center", tw.gapY(7))}>
              <ConfirmAmount
                title="請求額・手数料"
                amount={amount}
                sendToken={sendToken}
                feeToken={feeToken}
                feeDisplayValue={feeDisplayValue}
              />
              <QRCode
                ref={qrCodeRef}
                path="transfer"
                query={{ chain, sendToken, feeToken, recipient, amount }}
                size={tw.scaleNum(275)}
              />
            </VStack>
          </ScrollView>
          <HStack className={tw.gapX(4)}>
            <SubContainButton text="戻る" size="lg" className="flex-1" onPress={componentProps.onClose} />
            <ContainButton text="共有" size="lg" className="flex-1" onPress={handleShareInvoice} />
          </HStack>
        </VStack>
      </BottomActionSheet>

      <AlertDialog title="QRコード共有の失敗" isOpen={isShowErrorDialog} onClose={setIsShowErrorDialog.off} size="lg">
        <VStack className={cn(tw.py(4), tw.gapY(2))}>
          <ErrorText>不明なエラーによりQRコードの共有に失敗しました。</ErrorText>
        </VStack>
      </AlertDialog>
    </>
  );
};

export default ReceiveConfirm;
