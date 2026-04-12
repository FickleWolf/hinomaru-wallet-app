import { AppText } from "@/presentation/components/AppText";
import { Box } from "@/presentation/components/gluestack-ui/box";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { Image } from "@/presentation/components/gluestack-ui/image";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";

import OnBordingActions from "./_components/OnBordingActions";

const OnBording = () => {
  const tw = useTw();

  return (
    <VStack className={cn("flex-1", "bg-white", "items-center", tw.pt(20), tw.pb(10))}>
      <HStack className="items-center">
        <Image size="sm" source={require("@/presentation/assets/images/splash.png")} alt="image" />
        <AppText t="2xl" className="font-bold">
          SHACKW WALLET
        </AppText>
      </HStack>

      <Box className="w-full aspect-[1]">
        <Image size="full" source={require("@/presentation/assets/images/onboarding.png")} alt="image" />
      </Box>

      <OnBordingActions />

      <AppText t="sm">Powerd By Shackw</AppText>
    </VStack>
  );
};

export default OnBording;
