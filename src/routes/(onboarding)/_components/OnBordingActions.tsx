import { ContainButton, OutlineButton } from "@/presentation/components/Button";
import { VStack } from "@/presentation/components/gluestack-ui/vstack";
import { useBoolean } from "@/presentation/hooks/useBoolean";
import { useShackwWalletContext } from "@/presentation/providers/ShackwWalletProvider";
import { useTw } from "@/presentation/styles/tw";
import { cn } from "@/shared/helpers/cn";
import CreateWalletDialog from "@routesc/CreateWalletDialog";
import RestoreWalletField from "@routesc/RestoreWalletField";

const OnBordingActions = () => {
  const tw = useTw();
  const [isCreating, setIsCreating] = useBoolean(false);
  const [isRestoring, setIsRestoring] = useBoolean(false);

  const { createWallet, restoreWallet } = useShackwWalletContext();

  return (
    <>
      <VStack className={cn("w-full", "mt-auto", tw.px(16), tw.py(4), tw.gapY(5))}>
        <ContainButton text="新規作成" size="lg" onPress={setIsCreating.on} />
        <OutlineButton text="復元" size="lg" onPress={setIsRestoring.on} />
      </VStack>

      <CreateWalletDialog isOpen={isCreating} onClose={setIsCreating.off} onCreateWallet={createWallet} />
      <RestoreWalletField
        componentProps={{ title: "秘密鍵からの復元", size: "lg", isOpen: isRestoring, onClose: setIsRestoring.off }}
        onRestoreWallet={restoreWallet}
      />
    </>
  );
};

export default OnBordingActions;
