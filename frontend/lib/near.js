"use client";

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import * as nearAPI from "near-api-js";

let selectorInstance = null;
let modalInstance = null;

export const CONTRACT_ID = process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || "vaultdeck.testnet";
export const NETWORK_ID = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";

export async function initNearWallet() {
  if (typeof window === "undefined") return null;
  if (selectorInstance) {
    const state = selectorInstance.store.getState();
    const accountId = state.accounts.find((acc) => acc.active)?.accountId || null;
    return { selector: selectorInstance, modal: modalInstance, accountId };
  }

  try {
    selectorInstance = await setupWalletSelector({
      network: NETWORK_ID,
      modules: [setupMyNearWallet()],
    });

    modalInstance = setupModal(selectorInstance, {
      contractId: CONTRACT_ID,
    });

    const state = selectorInstance.store.getState();
    const accountId = state.accounts.find((acc) => acc.active)?.accountId || null;

    return { selector: selectorInstance, modal: modalInstance, accountId };
  } catch (err) {
    console.error("NEAR Wallet Selector init error:", err);
    return null;
  }
}

export async function showWalletModal() {
  const wallet = await initNearWallet();
  if (wallet?.modal) {
    wallet.modal.show();
  }
}

export async function signOutNearWallet() {
  const wallet = await initNearWallet();
  if (wallet?.selector) {
    const activeWallet = await wallet.selector.wallet();
    await activeWallet.signOut();
    window.location.reload();
  }
}

export async function getLiveNearAccountBalance(accountId) {
  if (!accountId) return "0.00";
  try {
    const provider = new nearAPI.JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
    const account = await provider.viewAccount({ accountId });
    return nearAPI.formatNearAmount(account.amount, 2);
  } catch (err) {
    console.warn("Could not fetch NEAR balance:", err.message);
    return "0.00";
  }
}
