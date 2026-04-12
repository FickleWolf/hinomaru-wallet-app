import { useStore } from "@tanstack/react-form";

import { ContainButton } from "@/presentation/components/Button";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { InfoText } from "@/presentation/components/Text";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useTw } from "@/presentation/styles/tw";
import type { Token } from "@/registries/ChainTokenRegistry";
import { cn } from "@/shared/helpers/cn";

import useReceiveForm from "../_hooks/useReceiveForm";

import ReceiveConfirm from "./ReceiveConfirm";

import type { Address } from "viem";

type ReceiveSubmitButtonProps = { recipient: Address };

const ReceiveSubmitButton = (props: ReceiveSubmitButtonProps) => {
  const tw = useTw();
  const { recipient } = props;
  const receiveForm = useReceiveForm();
  const { form, sendToken, fee, isValid } = receiveForm;

  const [isSharing, setIsSharing] = useBoolean(false);

  const amount = useStore(form.baseStore, s => {
    const v = s.values.amount;
    return v === "" ? 0 : Number(v);
  });
  const feeToken = useStore(form.baseStore, s => s.values.feeToken as Token);

  return (
    <>
      <VStack className={cn(tw.px(4), tw.pt(5), tw.gapY(5))}>
        <InfoText>{`手数料は、取引が実行されるチェーンと、手数料として使用する通貨によって自動的に決まります。`}</InfoText>
        <ContainButton
          text="QRコードを作成"
          size="lg"
          isLoading={isValid && !fee}
          isDisabled={!isValid}
          onPress={setIsSharing.on}
          className="w-full mx-auto"
        />
      </VStack>

      <ReceiveConfirm
        recipient={recipient}
        amount={amount}
        sendToken={sendToken}
        feeToken={feeToken}
        feeDisplayValue={fee?.display ?? 0}
        componentProps={{ title: "請求リンクの共有", size: "lg", isOpen: isSharing, onClose: setIsSharing.off }}
      />
    </>
  );
};

export default ReceiveSubmitButton;
