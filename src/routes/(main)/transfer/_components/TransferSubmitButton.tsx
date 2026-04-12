import { useStore } from "@tanstack/react-form";

import { ContainButton } from "@/presentation/components/Button";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { ErrorText, InfoText } from "@/presentation/components/Text";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useTw } from "@/presentation/styles/tw";
import type { Token } from "@/registries/ChainTokenRegistry";
import { cn } from "@/shared/helpers/cn";
import useAddressesRow from "@mainh/useAddressesRow";

import useTransferForm from "../_hooks/useTransferForm";

import TransferConfirm from "./TransferConfirm";

import type { Address } from "viem";

const TransferSubmitButton = () => {
  const tw = useTw();
  const transferForm = useTransferForm();
  const { form, sendToken, fee, isValid, insuff } = transferForm;

  const { addressToName } = useAddressesRow();
  const [isConfirming, setIsConfirming] = useBoolean(false);

  const amount = useStore(form.baseStore, s => {
    const v = s.values.amount;
    return v === "" ? 0 : Number(v);
  });
  const feeToken = useStore(form.baseStore, s => s.values.feeToken as Token);
  const recipient = useStore(form.baseStore, s => s.values.recipient as Address);

  return (
    <>
      <VStack className={cn(tw.px(4), tw.pt(5), tw.gapY(5))}>
        {insuff.insufficient && insuff.message ? (
          <ErrorText>{insuff.message}</ErrorText>
        ) : (
          <InfoText>
            {`手数料は、取引が実行されるチェーンと、手数料として使用する通貨によって自動的に決まります。`}
          </InfoText>
        )}

        <ContainButton
          text="確認画面へ"
          size="lg"
          isLoading={isValid && !fee}
          isDisabled={!isValid || insuff.insufficient}
          onPress={setIsConfirming.on}
          className={cn("w-full", "mx-auto")}
        />
      </VStack>

      <TransferConfirm
        name={addressToName[recipient.toLowerCase()]}
        recipient={recipient}
        amount={amount}
        sendToken={sendToken}
        feeToken={feeToken}
        feeDisplyValue={fee?.display ?? 0}
        componentProps={{ title: "内容確認", size: "lg", isOpen: isConfirming, onClose: setIsConfirming.off }}
      />
    </>
  );
};

export default TransferSubmitButton;
