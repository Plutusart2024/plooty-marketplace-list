import { WalletApiCip0030, SupportedWallet } from "@cardano/wallet";

declare global {
  interface Window {
    cardano?: Record<SupportedWallet, WalletApiCip0030>;
  }
}
