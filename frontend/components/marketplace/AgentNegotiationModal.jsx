"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  TrendingDown,
  Layers
} from "lucide-react";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function AgentNegotiationModal({ card, isOpen, onClose, onSettled }) {
  const { connectedAccount, loadData } = useApp();
  const [messages, setMessages] = useState([]);
  const [offerInput, setOfferInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState(null);
  const [isSettling, setIsSettling] = useState(false);
  const [settledSuccess, setSettledSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const chatBottomRef = useRef(null);

  const askingPrice = Number(card?.asking_price_usdc || card?.oracle_fair_value_usdc || 100);
  const vaultName = card?.vault?.name || "Merchant Agent";
  const subAccount = card?.vault?.sub_account || "merchant.colliq.testnet";

  // Initialize conversation when modal opens
  useEffect(() => {
    if (!isOpen || !card) return;

    setAgreedPrice(null);
    setSettledSuccess(null);
    setErrorMsg("");
    setOfferInput(String(Math.round(askingPrice * 0.95)));
    setMessageInput("");

    const initialGreeting = {
      id: "init-1",
      sender: "agent",
      role: "assistant",
      text: `Hello! I am the autonomous trading brain managing ${vaultName}. I have listed this authenticated ${card.name} (${card.grade || "PSA 10"}) for $${askingPrice.toLocaleString()} USDC. ${
        card.allow_barter ? "I am open to reasonable offers." : "This listing is strictly Cash/USDC only."
      } What offer would you like to put on the table?`,
      timestamp: new Date().toISOString()
    };

    setMessages([initialGreeting]);
  }, [isOpen, card?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmitting]);

  if (!isOpen || !card) return null;

  const handleSendOffer = async (e) => {
    e?.preventDefault();
    const offerNum = parseFloat(offerInput);
    if (isNaN(offerNum) || offerNum <= 0) {
      setErrorMsg("Please enter a valid numeric offer in USDC.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const userText = messageInput.trim() || `I am offering $${offerNum.toLocaleString()} USDC for this slab.`;
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      role: "user",
      text: userText,
      offer_usdc: offerNum,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setMessageInput("");

    try {
      const res = await api.post(`/market/cards/${card.id || card.card_id}/negotiate-buy`, {
        offer_usdc: offerNum,
        buyer_message: userText,
        buyer_account: connectedAccount || "buyer.testnet",
        chat_history: updatedHistory.map((m) => ({
          role: m.role || (m.sender === "user" ? "user" : "assistant"),
          content: m.text
        }))
      });

      const { decision, message, counter_price_usdc, agreed_price_usdc } = res.data;

      const agentReply = {
        id: `agt-${Date.now()}`,
        sender: "agent",
        role: "assistant",
        text: message,
        decision,
        counter_price_usdc,
        agreed_price_usdc,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, agentReply]);

      if (decision === "ACCEPT" && agreed_price_usdc) {
        setAgreedPrice(agreed_price_usdc);
      } else if (counter_price_usdc) {
        setOfferInput(String(counter_price_usdc));
      }
    } catch (err) {
      console.error("Negotiation error:", err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to communicate with agent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettlePurchase = async () => {
    const finalPrice = agreedPrice || askingPrice;
    setIsSettling(true);
    setErrorMsg("");

    try {
      const res = await api.post(`/market/cards/${card.id || card.card_id}/settle-agent-sale`, {
        agreed_price_usdc: finalPrice,
        buyer_account: connectedAccount || "buyer.testnet"
      });

      setSettledSuccess({
        tradeId: res.data?.trade?.trade_id || `sale-${Date.now()}`,
        price: finalPrice,
        buyer: connectedAccount || "buyer.testnet"
      });

      await loadData();
      if (onSettled) onSettled(res.data);
    } catch (err) {
      console.error("Settlement error:", err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to settle purchase.");
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl lg:max-w-3xl rounded-[24px] sm:rounded-[28px] bg-white border border-neutral-200 shadow-2xl overflow-hidden text-neutral-900 flex flex-col max-h-[88vh] sm:max-h-[85vh] my-auto">
        
        {/* Top Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-100 flex items-center justify-between gap-3 shrink-0 bg-[#fbfdfc]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#073525] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                  Negotiate with {vaultName}
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  AI ONLINE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono truncate">
                {subAccount}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Card Overview Strip */}
        <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-neutral-50/70 border-b border-neutral-100 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-10 sm:w-9 sm:h-11 rounded-lg bg-white border border-neutral-200 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
              <img
                src={card.image_url}
                alt={card.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-500 mb-0.5">
                <span className="px-1 py-0.2 rounded bg-neutral-200 text-neutral-800 font-bold">
                  {card.grade || "PSA 10"}
                </span>
                <span>#{card.psa_cert_number || "CERT"}</span>
              </div>
              <h4 className="font-semibold text-neutral-900 truncate text-xs" title={card.name}>
                {card.name}
              </h4>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] text-neutral-400 block uppercase font-mono tracking-wider">
              Asking Price
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900">
              ${askingPrice.toLocaleString()} USDC
            </span>
            <span className="block text-[9px] text-neutral-500">
              {card.allow_barter ? "Swaps Allowed" : "Cash Only"}
            </span>
          </div>
        </div>

        {/* Chat History Viewport */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 bg-[#fafcfb]">
          {messages.map((msg) => {
            const isUser = msg.sender === "user" || msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#073525] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                    isUser
                      ? "bg-[#073525] text-white rounded-tr-xs"
                      : "bg-white border border-neutral-200/90 text-neutral-800 shadow-xs rounded-tl-xs"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Badges for counter or agreement */}
                  {msg.counter_price_usdc && (
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold">
                        Agent Counter: ${msg.counter_price_usdc.toLocaleString()} USDC
                      </span>
                    </div>
                  )}

                  {msg.decision === "ACCEPT" && (
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        DEAL ACCEPTED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSubmitting && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
              <div className="w-7 h-7 rounded-xl bg-[#073525] text-white flex items-center justify-center text-xs shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="px-3 py-2 rounded-2xl bg-white border border-neutral-200 text-neutral-500 text-xs flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Agent is analyzing offer and valuation parameters...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Agreed Banner (if Deal Closed) */}
        {agreedPrice && !settledSuccess && (
          <div className="px-5 py-3.5 bg-emerald-50 border-t border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-emerald-950">
                  Offer Accepted: ${agreedPrice.toLocaleString()} USDC
                </h5>
                <p className="text-[11px] text-emerald-700">
                  The selling agent has locked this agreement. Finalize purchase to transfer custody.
                </p>
              </div>
            </div>

            <button
              onClick={handleSettlePurchase}
              disabled={isSettling}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSettling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Settling on NEAR...</span>
                </>
              ) : (
                <>
                  <span>Complete Purchase (${agreedPrice.toLocaleString()} USDC)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Settled Success Message */}
        {settledSuccess && (
          <div className="p-5 bg-emerald-500 text-white space-y-2 text-center animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-white/20 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-sm">Purchase Completed & Settled!</h4>
            <p className="text-xs text-emerald-100 max-w-md mx-auto">
              "{card.name}" has been transferred to {settledSuccess.buyer} for ${settledSuccess.price.toLocaleString()} USDC. Custody and trade history are registered on NEAR testnet.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded-lg bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer"
              >
                Close & View Collection
              </button>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="px-5 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Offer Input & Haggling Controls (only if not settled) */}
        {!settledSuccess && (
          <div className="p-3 sm:p-3.5 border-t border-neutral-100 bg-white space-y-2 shrink-0">
            {/* Quick Offer Chips */}
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              <span>Quick Offer:</span>
              <button
                type="button"
                onClick={() => setOfferInput(String(Math.round(askingPrice * 0.95)))}
                className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono transition cursor-pointer"
              >
                -5% (${Math.round(askingPrice * 0.95)})
              </button>
              <button
                type="button"
                onClick={() => setOfferInput(String(Math.round(askingPrice * 0.90)))}
                className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono transition cursor-pointer"
              >
                -10% (${Math.round(askingPrice * 0.90)})
              </button>
              <button
                type="button"
                onClick={() => setOfferInput(String(askingPrice))}
                className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold transition cursor-pointer"
              >
                Match Asking (${askingPrice})
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative w-36 sm:w-44 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value)}
                    placeholder="Offer USDC"
                    className="w-full pl-6 pr-12 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#073525] focus:bg-white"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400">
                    USDC
                  </span>
                </div>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Enter your message or counter-offer reasoning..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#073525] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-3.5 rounded-xl bg-[#073525] hover:bg-[#0b4d37] text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Haggle</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
