import { useStore } from "@tanstack/react-form";
import { useLocalSearchParams } from "expo-router";
import { useRef, useCallback, useEffect } from "react";
import * as v from "valibot";

import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useWalletPreferencesContext } from "@/presentation/providers/WalletPreferencesProvider";
import type { Token } from "@/registries/ChainTokenRegistry";

import TransferSearchParamsSchema from "../_validators/TransferSearchParamsSchema";

import useTransferForm from "./useTransferForm";

import type { TransferSearchParams, ParsedTransferSearchParams } from "../_validators/TransferSearchParamsSchema";
import type { Address } from "viem";

const useTransferSearchParam = () => {
  const { setCurrentChain } = useWalletPreferencesContext();
  const rawParams = useLocalSearchParams<TransferSearchParams>();
  const { form, fee, sendToken, isValid, insuff, setSendToken } = useTransferForm();

  const initializedRef = useRef(false);

  const [isError, setIsError] = useBoolean(false);
  const [isParsing, setIsParsing] = useBoolean(true);
  const [isConfirmed, setIsConfirmed] = useBoolean(false);
  const [isConfirming, setIsConfirming] = useBoolean(false);

  const amount = useStore(form.baseStore, s => {
    const v = s.values.amount;
    return v === "" ? 0 : Number(v);
  });
  const feeToken = useStore(form.baseStore, s => s.values.feeToken as Token);
  const recipient = useStore(form.baseStore, s => s.values.recipient as Address);

  const applyParsedParams = useCallback(
    async ({ chain, amount, recipient, feeToken }: ParsedTransferSearchParams) => {
      setCurrentChain(chain);

      form.setFieldValue("amount", amount);
      form.setFieldValue("recipient", recipient);
      form.setFieldValue("feeToken", feeToken);

      await form.validateAllFields("change");
      setIsParsing.off();
    },
    [form, setIsParsing, setCurrentChain]
  );

  useEffect(() => {
    if (initializedRef.current || isConfirmed) return;

    const parsed = v.safeParse(TransferSearchParamsSchema, rawParams);
    if (!parsed.success) {
      setIsError.on();
      setIsConfirmed.on();
      setIsParsing.off();
      initializedRef.current = true;
      return;
    }

    const { chain, amount, feeToken, recipient, sendToken } = parsed.output;

    if (!(chain && amount && feeToken && recipient && sendToken)) {
      setIsConfirmed.on();
      setIsParsing.off();
      initializedRef.current = true;
      return;
    }

    setSendToken(sendToken);

    const id = requestAnimationFrame(() => {
      void (async () => {
        await applyParsedParams({ chain, amount, feeToken, recipient });
        initializedRef.current = true;
      })();
    });

    return () => cancelAnimationFrame(id);
  }, [rawParams, isConfirmed, setIsConfirmed, setIsError, setIsParsing, setSendToken, applyParsedParams]);

  useEffect(() => {
    if (isConfirmed) return;
    if (!isValid) return;
    if (insuff.insufficient) return;
    if (!fee) return;

    setIsConfirming.on();
    setIsConfirmed.on();
  }, [fee, insuff.insufficient, isConfirmed, isValid, setIsConfirmed, setIsConfirming]);

  return {
    isParsing,
    isConfirming,
    isError,
    confirmProps: {
      amount,
      sendToken,
      recipient,
      feeToken,
      feeDisplyValue: fee?.display ?? 0
    },
    setIsConfirming,
    setIsError
  };
};

export default useTransferSearchParam;
