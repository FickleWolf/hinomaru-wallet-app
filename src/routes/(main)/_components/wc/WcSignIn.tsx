import { ScrollView } from "react-native";

import type { ShackwSignInParams } from "@/application/ports/WalletConnectHandlers";
import { AppText } from "@/presentation/components/AppText";
import { BottomActionSheet } from "@/presentation/components/BottomActionSheet";
import { SubContainButton, ContainButton } from "@/presentation/components/Button";
import { Box } from "@/presentation/components/gluestack-ui/box";
import { HStack } from "@/presentation/components/gluestack-ui/hstack";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";

import type { SignClientTypes } from "@walletconnect/types";

type WcSignInProps = {
  params?: ShackwSignInParams;
  peerMeta?: SignClientTypes.Metadata;
  componentProps: Omit<React.ComponentProps<typeof BottomActionSheet>, "children" | "onClose">;
  onApproveSignIn: () => void;
  onCancelSignIn: () => void;
};

const WcSignIn = (props: WcSignInProps) => {
  const { params, peerMeta, componentProps, onApproveSignIn, onCancelSignIn } = props;

  const tw = useTw();

  const name = peerMeta?.name ?? "Unknown";
  const url = peerMeta?.url ?? "";
  const description = peerMeta?.description ?? "";
  const message = params?.message ?? "";

  return (
    <BottomActionSheet {...componentProps} onClose={onCancelSignIn}>
      <VStack className={cn("w-full h-full justify-between", tw.gapY(7))}>
        <VStack className={cn("w-full flex-1", tw.gapY(7))}>
          <AppText t="md" className="text-center font-bold text-secondary-700">
            {"以下のアプリが署名を求めています。\n内容を確認し、問題なければ「許可」を押してください。"}
          </AppText>

          <ScrollView className="w-full flex-1" showsVerticalScrollIndicator={false}>
            <VStack className={cn(tw.gapY(5))}>
              <VStack className={cn("w-full", tw.gapY(2))}>
                <HStack className={cn(tw.gapX(2))}>
                  <Box className={cn(tw.w(1.5), "bg-primary-500")} />
                  <AppText t="md" className="font-bold">
                    アプリ情報
                  </AppText>
                </HStack>

                <VStack className={cn("bg-secondary-50 rounded-xl border-secondary-300", tw.p(4), tw.gapY(3))}>
                  <VStack className={cn(tw.gapY(1))}>
                    <AppText t="sm" className="font-bold text-secondary-600">
                      名前
                    </AppText>
                    <AppText t="md" className="font-bold text-secondary-800 text-right" oneLine>
                      {name}
                    </AppText>
                  </VStack>

                  {url ? (
                    <VStack className={cn(tw.gapY(1))}>
                      <AppText t="sm" className="font-bold text-secondary-600">
                        URL
                      </AppText>
                      <AppText t="md" className="font-bold text-secondary-800 text-right" oneLine>
                        {url}
                      </AppText>
                    </VStack>
                  ) : null}

                  {description ? (
                    <VStack className={cn(tw.gapY(1))}>
                      <AppText t="sm" className="font-bold text-secondary-600">
                        説明
                      </AppText>
                      <AppText t="md" className="font-bold text-secondary-800 text-right">
                        {description}
                      </AppText>
                    </VStack>
                  ) : null}
                </VStack>
              </VStack>

              {message ? (
                <VStack className={cn("w-full", tw.gapY(2))}>
                  <HStack className={cn(tw.gapX(2))}>
                    <Box className={cn(tw.w(1.5), "bg-primary-500")} />
                    <AppText t="md" className="font-bold">
                      署名内容
                    </AppText>
                  </HStack>

                  <VStack className={cn("bg-secondary-50 rounded-xl border-secondary-300", tw.p(4))}>
                    <AppText t="sm" className="text-secondary-800">
                      {message}
                    </AppText>
                  </VStack>
                </VStack>
              ) : null}
            </VStack>
          </ScrollView>
        </VStack>

        <HStack className={cn(tw.gapX(4))}>
          <SubContainButton text="拒否" size="lg" className="flex-1" onPress={onCancelSignIn} />
          <ContainButton text="許可" size="lg" className="flex-1" onPress={onApproveSignIn} />
        </HStack>
      </VStack>
    </BottomActionSheet>
  );
};

export default WcSignIn;
