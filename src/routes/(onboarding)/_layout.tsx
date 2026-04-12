import { Redirect, Slot } from "expo-router";
import { StatusBar } from "react-native";

import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";

const OnbordingLayout = () => {
  const { account, hasPrivateKey } = useShackwWalletContext();
  const hasWallet = !!account && !!hasPrivateKey;

  if (hasWallet) return <Redirect href="/(main)/(tabs)" />;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Slot />
    </>
  );
};

export default OnbordingLayout;
