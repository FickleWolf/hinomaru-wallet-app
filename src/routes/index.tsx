import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import { useLoadingOverlay } from "@/presentation/providers/LoadingOverlayProvider";
import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";
import { normalizeParams } from "@/shared/helpers/path";

const AppIndex = () => {
  const { show, hide } = useLoadingOverlay();
  const { account, hasPrivateKey, walletEnabled } = useShackwWalletContext();

  const params = useLocalSearchParams<Record<string, string | string[]>>();

  const isLoading = !account && hasPrivateKey;
  const hasWallet = !!account && !!hasPrivateKey;

  useEffect(() => {
    if (isLoading) show();
    else hide();
  }, [isLoading, show, hide]);

  if (isLoading) return null;

  if (!hasWallet) return <Redirect href="/(onboarding)" />;

  const search = normalizeParams(params);
  return <Redirect href={{ pathname: "/(main)/(tabs)", ...(walletEnabled ? { params: search } : {}) }} />;
};

export default AppIndex;
