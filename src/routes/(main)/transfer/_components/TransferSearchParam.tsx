import { memo, useEffect } from "react";

import { AlertDialog } from "@/presentation/components/Dialog";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { ErrorText } from "@/presentation/components/Text";
import { useLoadingOverlay } from "@/presentation/providers/LoadingOverlayProvider";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";
import useAddressesRow from "@mainh/useAddressesRow";

import useTransferSearchParam from "../_hooks/useTransferSearchParam";

import TransferConfirm from "./TransferConfirm";

const TransferSearchParam = () => {
  const tw = useTw();
  const { show, hide } = useLoadingOverlay();
  const { addressToName } = useAddressesRow();
  const { isParsing, isConfirming, isError, confirmProps, setIsConfirming, setIsError } = useTransferSearchParam();

  useEffect(() => {
    if (!isParsing) return;
    show();

    return () => {
      hide();
    };
  }, [isParsing, show, hide]);

  if (isParsing) return null;

  return (
    <>
      <TransferConfirm
        {...confirmProps}
        name={addressToName[confirmProps.recipient.toLowerCase()]}
        componentProps={{ title: "内容確認", size: "lg", isOpen: isConfirming, onClose: setIsConfirming.off }}
      />

      <AlertDialog title="読み取りエラー" isOpen={isError} onClose={setIsError.off} size="lg">
        <VStack className={cn(tw.py(4), tw.gapY(1))}>
          <ErrorText>読み込まれた情報が正しくない可能性があります。</ErrorText>
        </VStack>
      </AlertDialog>
    </>
  );
};

export default memo(TransferSearchParam);
