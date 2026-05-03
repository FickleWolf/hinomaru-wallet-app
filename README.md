# Shackw Wallet

Non-custodial stablecoin wallet with gasless transfers via EIP-7702.

Built with React Native / Expo.

---

## Overview

- Stablecoin-only (JPYC / USDC)
- Gasless transfers via EIP-7702 delegate execution
- Quote-driven transfer flow: quote → authorization → relay
- 1 user = 1 wallet
- WalletConnect support (Polygon, minimal RPC)

Private keys are never uploaded. All signing is performed locally on-device.

---

## Supported Tokens

- JPYC
- USDC

---

## Supported Chain

- Polygon (fixed)

---

## Transfer Flow

1. User selects recipient, token, and amount
2. App requests a quote from Wallet API
3. App signs an EIP-7702 authorization locally
4. App submits the signed payload for relay execution
5. App tracks transaction status

Direct EOA transaction submission is intentionally unsupported.

---

## WalletConnect

Supported RPCs: `eth_accounts` / `eth_chainId` / `eth_sendTransaction` / `personal_sign`

All chain switch / add requests are rejected.

---

## Local Persistence

- Address book (send targets only)
- Cached transaction history
- User preferences

Private keys are stored in platform-secure storage and never committed.

---

## Security

- Private keys generated and stored on-device only
- Signing performed locally
- Quoted execution parameters are locally reconstructed and verified before authorization

This repository does not contain `.env` files, Firebase config, EAS credentials, or any production secrets.

---

## Development

\```bash
yarn install
yarn start
yarn start:clear  # clear cache
yarn check        # format + lint + typecheck
\```

---

## Repository Structure

\```
src/
├── domain          # Domain models & value objects
├── application     # Use cases, services, ports
├── infrastructure  # HTTP, secure storage, local DB adapters
├── presentation    # UI, screens, hooks, components
└── shared          # Helpers, validations, utilities
\```

---

## Author

**Shackw**