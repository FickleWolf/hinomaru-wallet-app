import type { Chain } from "@/config/chain";
import type { ShackwApiMetaModel, WalletMetaItem } from "@/domain/shackwApiMeta";
import type { Token } from "@/registries/ChainTokenRegistry";
import { isChain, isToken } from "@/registries/ChainTokenRegistry";
import { CustomError } from "@/shared/exceptions";

import type { GetWalletSummaryResult, WalletMetaGateway } from "../ports/WalletMetaGateway";

export const WalletMetaService = {
  async getSummary(walletMetaGateway: WalletMetaGateway): Promise<ShackwApiMetaModel> {
    try {
      const meta = await walletMetaGateway.get();
      return buildWalletMetaModel(meta);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof CustomError) {
        throw new Error(error.message);
      }

      throw new Error("不明なエラーによりウォレットメタ情報を取得できませんでした。");
    }
  }
};

function buildWalletMetaModel(meta: GetWalletSummaryResult["data"]): ShackwApiMetaModel {
  const result = createInitialWalletMeta();

  const ensureTokenMeta = (chain: Chain, token: Token): WalletMetaItem => {
    if (!result[chain]) {
      result[chain] = {};
    }
    if (!result[chain]![token]) {
      result[chain]![token] = {
        minTransfer: { minUnits: 0n, display: 0 },
        fixedFee: { minUnits: 0n, display: 0 }
      };
    }
    return result[chain]![token]!;
  };

  // minTransfers -> minTransfer
  for (const entry of meta.minTransfers) {
    if (!isChain(entry.chainKey)) continue;
    if (!isToken(entry.tokenSymbol)) continue;

    const tokenMeta = ensureTokenMeta(entry.chainKey, entry.tokenSymbol);

    tokenMeta.minTransfer = {
      minUnits: BigInt(entry.minTransferAmountDisplay),
      display: entry.minTransferAmountDisplay
    };
  }

  // fixedFees -> fixedFee
  for (const entry of meta.fixedFees) {
    if (!isChain(entry.chainKey)) continue;
    if (!isToken(entry.tokenSymbol)) continue;

    const tokenMeta = ensureTokenMeta(entry.chainKey, entry.tokenSymbol);

    tokenMeta.fixedFee = {
      minUnits: BigInt(entry.fixedFeeAmountUnits),
      display: entry.fixedFeeAmountDisplay
    };
  }

  return result;
}

function createInitialWalletMeta(): ShackwApiMetaModel {
  return {
    mainnet: {
      JPYC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      USDC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      EURC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } }
    },
    base: {
      USDC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      EURC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } }
    },
    polygon: {
      JPYC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      USDC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } }
    },
    sepolia: {
      JPYC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      USDC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      EURC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } }
    },
    baseSepolia: {
      USDC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      EURC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } }
    },
    polygonAmoy: {
      JPYC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } },
      USDC: { fixedFee: { display: 0, minUnits: 0n }, minTransfer: { display: 0, minUnits: 0n } }
    }
  };
}
