import type { Chain } from "@/config/chain";
import type { Token } from "@/registries/ChainTokenRegistry";

import type { Account, WalletClient, Address } from "viem";

export type GetTokenBalanceCommand = {
  chain: Chain;
  wallet: Address;
  token: Token;
};

export type TransferTokenCommand = {
  account: Account;
  client: WalletClient;
  token: Token;
  feeToken: Token;
  recipient: Address;
  amountDisplayValue: number;
};
