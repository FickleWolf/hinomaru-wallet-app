import React, { useCallback, useState } from "react";

import { BottomActionSheet } from "@/presentation/components/BottomActionSheet";
import { Box } from "@/presentation/components/gluestack-ui/box";
import { Tab } from "@/presentation/components/Tab";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";

import TransferRecipientDirectForm from "./TransferRecipientDirectForm";
import TransferRecipientSelector from "./TransferRecipientSelector";

import type { TransferFormContextType } from "../../_hooks/useTransferForm";
import type useAddressesRow from "@mainh/useAddressesRow";

type TransferRecipientFieldProps = {
  prevValue: string;
  transferForm: TransferFormContextType;
  useAddressesRowResult: ReturnType<typeof useAddressesRow>;
  componentProps: Omit<React.ComponentProps<typeof BottomActionSheet>, "children">;
};

const INPUT_METHODS = {
  DIRECT: "直接入力",
  SELECT: "アドレス帳"
} as const;
type InputMethods = keyof typeof INPUT_METHODS;

const TransferRecipientField = (props: TransferRecipientFieldProps) => {
  const tw = useTw();
  const { prevValue, transferForm, useAddressesRowResult, componentProps } = props;

  const { form } = transferForm;
  const { addressRows, searchText, searchTextRef, isError, handleChangeSearchText } = useAddressesRowResult;

  const [currentTab, setCurrentTab] = useState<InputMethods>("DIRECT");

  const handleClose = useCallback(() => {
    setCurrentTab("DIRECT");
    handleChangeSearchText("");
    componentProps.onClose();
  }, [componentProps, handleChangeSearchText]);

  const handleReset = useCallback(() => {
    form.setFieldValue("recipient", prevValue);
    handleClose();
  }, [form, handleClose, prevValue]);

  return (
    <BottomActionSheet {...componentProps} onClose={handleReset}>
      <Tab options={INPUT_METHODS} value={currentTab} handleChange={setCurrentTab} />
      <Box className={cn("w-full", "flex-1", tw.py(4))}>
        {currentTab === "DIRECT" ? (
          <TransferRecipientDirectForm form={form} handleClose={handleClose} />
        ) : (
          <TransferRecipientSelector
            form={form}
            searchText={searchText}
            addressRows={addressRows}
            searchTextRef={searchTextRef}
            isError={isError}
            handleClose={handleClose}
            handleChangeSearchText={handleChangeSearchText}
          />
        )}
      </Box>
    </BottomActionSheet>
  );
};

export default TransferRecipientField;
