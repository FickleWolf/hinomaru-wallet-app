import { cn } from "tailwind-variants";

import BackDrop from "@/presentation/components/BackDrop";
import { Box } from "@/presentation/components/gluestack-ui/box";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";
import { useTw } from "@/presentation/styles/tw";

import ScreenContainer from "../_components/ScreenContainer";

import ReceiveAmount from "./_components/ReceiveAmount";
import ReceiveFeeToken from "./_components/ReceiveFeeToken";
import ReceiveSendToken from "./_components/ReceiveSendToken";
import ReceiveSubmitButton from "./_components/ReceiveSubmitButton";
import { ReceiveFormProvider } from "./_hooks/useReceiveForm";

const ReceiveScreen = () => {
  const { account } = useShackwWalletContext();

  const tw = useTw();

  if (!account) return <BackDrop visible />;

  return (
    <ScreenContainer appBarProps={{ title: "受け取り" }} className="bg-white rounded-t-2xl">
      <Box className={cn("flex-1", tw.py(2))}>
        <ReceiveFormProvider>
          <ReceiveSendToken />
          <VStack className="flex-1 bg-secondary-100">
            <VStack className="gap-y-8">
              <ReceiveFeeToken />
              <ReceiveAmount />
            </VStack>
            <ReceiveSubmitButton recipient={account.address} />
          </VStack>
        </ReceiveFormProvider>
      </Box>
    </ScreenContainer>
  );
};

export default ReceiveScreen;
