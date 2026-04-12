# Shackw Wallet (Native App)
Stablecoin-first mobile wallet using **Account Abstraction (EIP-7702)**

This repository contains the **Shackw Wallet native application** built with React Native / Expo.
Shackw Wallet is a **non-custodial**, stablecoin-focused wallet designed for **simple and predictable payments** with a minimal, opinionated UX.

This document describes the **environment-agnostic application architecture**, supported concepts, core user flows, and development guidelines.

---

# 1. Overview

The **Shackw Wallet Native App** provides:

- Fully non-custodial wallet generation and on-device key management
- Stablecoin-first UX (JPYC / USDC / EURC only)
- Account Abstraction–ready flows based on **EIP-7702**
- Quote-driven transfers via the Shackw Wallet API (relay-based execution)
- Transaction history and lightweight address book features
- WalletConnect-based login and session handling (where supported)

The application never uploads user private keys.
All cryptographic signing is performed locally on-device, and only signed payloads are sent to external services.
While transaction execution is relay-based and policy-controlled, users retain full control over authorization and signing.

---

# 2. Supported Concepts

## 2.1 Supported Tokens
Shackw Wallet is intentionally **stablecoin-only**.

- JPYC
- USDC
- EURC

Token availability may differ by chain and environment.
All token metadata is retrieved dynamically from the Shackw Wallet API.

---

## 2.2 Supported Chains
Supported chains vary by environment (Testnet / Mainnet).
Chain metadata is retrieved dynamically from the Shackw Wallet API.

While multiple chains may be supported, the app remains intentionally minimal and opinionated in its user-facing design.

---

## 2.3 Accounts / Wallets
The app manages one or more wallets locally.

- Wallets are **generated and stored on-device**
- Private keys are protected using platform-secure storage
- Backup and restore flows are supported (implementation-specific)

No wallet data is stored or managed by the backend.

---

# 3. Core Flows

This section outlines the primary user-facing flows.

---

## 3.1 Initialize (First Launch)
On first launch, the app:

- generates or restores a wallet
- initializes local persistence
- fetches chain and token metadata
- prepares application state for transfers

If wallet backup has not been completed, certain features may be restricted for safety.

---

## 3.2 Receive (Request Payment)
The app supports receiving payments by generating requests that may include:

- recipient address
- token and amount
- optional fee token selection (if applicable)

Requests can be rendered as QR codes or shared as structured payloads.

---

## 3.3 Transfer (Send Payment)
Transfers follow a **quote → authorization → relay** model.

High-level flow:

1. User selects recipient, token, and amount
2. App requests a **quote** from the Shackw Wallet API
3. App signs an authorization locally (**EIP-7702 authorization**)
4. App submits the signed payload for relay execution
5. App tracks the transaction status and updates history

The app remains fully non-custodial throughout the entire process.
Direct EOA transaction submission is intentionally unsupported; all transfers require EIP-7702 authorization and relay execution.

---

## 3.4 WalletConnect (Login / Session)
The app includes WalletConnect-based features such as:

- session proposal handling
- sign-in message support
- transfer authorization hooks (where applicable)

Exact supported methods depend on the current project milestone.

---

# 4. Local Data & Persistence

The app persists only minimal local data, including:

- non-sensitive wallet metadata
- user-managed address book entries
- cached transaction history
- user preferences (default chain, selected wallet)

Sensitive data such as private keys is stored using **platform-secure storage** and is never committed to this repository.

---

# 5. Security Notes

- Private keys are generated and stored **only on the device**
- The app never uploads or transmits private keys
- All signing operations occur locally
- Chain and token metadata is retrieved dynamically via the Shackw Wallet API
- Environment- and credential-dependent files are intentionally excluded from version control

This repository does **not** contain:
- `.env` files
- Firebase configuration files
- EAS credentials or signing keys
- any production secrets
- All quoted execution parameters are locally reconstructed and verified by the wallet before user authorization

---

# 6. Development Notes

## 6.1 Tooling
- Expo / React Native
- TypeScript
- TanStack Query
- Valibot
- NativeWind / Tailwind
- WalletConnect
- Firebase (minimal usage, e.g. App Check)

## 6.2 Commands
```bash
# install dependencies
yarn install

# start development server
yarn start

# start with cache cleared
yarn start:clear

# format, lint, and typecheck
yarn check
```

---

# 7. Repository Structure
```bash
src/
├── domain          # Domain models & value objects
├── application     # Use cases, services, ports (interfaces)
├── infrastructure  # HTTP, secure storage, local DB adapters
├── presentation    # UI, screens, hooks, components
└── shared          # helpers, validations, utilities
```

---

# 8. License

Internal use only unless otherwise specified.
License terms will be clarified at a later stage.

---

## Author

**Shackw**