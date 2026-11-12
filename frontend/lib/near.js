"use client";

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import * as nearAPI from "near-api-js";

let selectorInstance = null;
let modalInstance = null;

export const CONTRACT_ID = process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || "";
export const NETWORK_ID = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";
export const TREASURY_ACCOUNT = process.env.NEXT_PUBLIC_NEAR_TREASURY_ACCOUNT || "colliq.testnet";

// Convert USD/USDC to NEAR for Testnet demonstration (scaled & capped for reliable faucet testnet execution)
export function usdToNear(usdPrice) {
  const numeric = Number(usdPrice) || 0;
  if (numeric <= 0) return "0.10";
  // Scale proportionally for demo but cap at 1.25 NEAR so Testnet faucet wallets never fail
  const rawNear = numeric / 250;
  const clamped = Math.min(1.25, Math.max(0.10, rawNear));
  return clamped.toFixed(2);
}

export async function initNearWallet() {
  if (typeof window === "undefined") return null;
  if (selectorInstance) {
    const state = selectorInstance.store.getState();
    const accountId = state.accounts.find((acc) => acc.active)?.accountId || state.accounts[0]?.accountId || null;
    return { selector: selectorInstance, modal: modalInstance, accountId };
  }

  try {
    selectorInstance = await setupWalletSelector({
      network: NETWORK_ID,
      modules: [setupMeteorWallet()],
    });

    const modalOptions = {
      theme: "dark",
      description: "Connect your Meteor Wallet to trade on Colliq",
    };
    if (CONTRACT_ID) {
      modalOptions.contractId = CONTRACT_ID;
    }

    modalInstance = setupModal(selectorInstance, modalOptions);

    const state = selectorInstance.store.getState();
    const accountId = state.accounts.find((acc) => acc.active)?.accountId || state.accounts[0]?.accountId || null;

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

// Execute payment directly using connected Meteor Wallet on NEAR Testnet
export async function executeNearPayment({ receiverId = TREASURY_ACCOUNT, amountNear }) {
  const wallet = await initNearWallet();
  if (!wallet || !wallet.selector) {
    throw new Error("NEAR Wallet Selector could not be initialized.");
  }

  const state = wallet.selector.store.getState();
  const activeAccount = state.accounts.find((acc) => acc.active) || state.accounts[0];
  if (!activeAccount) {
    if (wallet.modal) wallet.modal.show();
    throw new Error("Please connect your Meteor Wallet first");
  }

  const activeWallet = await wallet.selector.wallet();
  const yoctoDeposit = nearAPI.parseNearAmount(String(amountNear)) || "50000000000000000000000";

  // Note: @near-wallet-selector/meteor-wallet invokes najActionToInternal(action)
  // which expects action.transfer to exist, whereas standard wallet selector expects
  // { type: "Transfer", params: { deposit } }. Providing both ensures full compatibility.
  const transferAction = {
    type: "Transfer",
    params: {
      deposit: yoctoDeposit,
    },
    transfer: {
      deposit: yoctoDeposit,
    },
  };

  const outcome = await activeWallet.signAndSendTransaction({
    signerId: activeAccount.accountId,
    receiverId: receiverId,
    actions: [transferAction],
  });

  let txHash = null;
  if (outcome) {
    if (typeof outcome === "string") {
      txHash = outcome;
    } else if (outcome.transaction?.hash) {
      txHash = outcome.transaction.hash;
    } else if (outcome.transaction_outcome?.id) {
      txHash = outcome.transaction_outcome.id;
    } else if (outcome.txHash) {
      txHash = outcome.txHash;
    } else if (outcome.hash) {
      txHash = outcome.hash;
    }
  }

  return {
    outcome,
    txHash: txHash || `tx-${Date.now().toString(36)}`,
    signerId: activeAccount.accountId,
    amountNear,
    receiverId
  };
}
