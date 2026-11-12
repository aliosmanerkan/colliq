"use client";

import { X, ArrowRightLeft, ShieldCheck, ShieldAlert, Clock, ExternalLink, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

export default function TradeDetailModal({ trade, isOpen, onClose }) {
  if (!isOpen || !trade) return null;

  const isRejected = trade.status === "REJECTED_GUARDRAIL";
  const cardA = trade.cards_from_a?.[0] || null;
  const cardB = trade.cards_from_b?.[0] || null;
  const valA = Number(cardA?.oracle_fair_value_usdc || 0);
  const valB = Number(cardB?.oracle_fair_value_usdc || 0);
  const cashFromA = Number(trade.usdc_from_a || 0);
  const cashFromB = Number(trade.usdc_from_b || 0);

  const formatFullDate = (dateString) => {
    if (!dateString) return "Nov 11, 2026";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Nov 11, 2026";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-[28px] border border-neutral-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-200/80 bg-[#f8faf9] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border ${
                isRejected 
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                {isRejected ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Declined (Guardrail Protection)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Settled On-Chain (NEAR)</span>
                  </>
                )}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Block #{trade.near_block || 276399000}
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>{trade.vault_a_name || "Agent A"}</span>
              <span className="text-neutral-400 font-normal">⇄</span>
              <span>{trade.vault_b_name || "Agent B"}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Swapped Cards Summary Card */}
          <div className="p-5 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>Trade Summary</span>
              <span>{formatFullDate(trade.createdAt)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Card A */}
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 flex items-center gap-3 shadow-sm">
                {cardA?.image_url && (
                  <img src={cardA.image_url} alt={cardA.name} className="w-14 h-18 object-contain rounded-lg bg-neutral-50 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-emerald-800 font-semibold">{trade.vault_a_name}</div>
                  <h4 className="text-xs font-semibold text-neutral-900 truncate" title={cardA?.name}>{cardA?.name || "Physical Slab"}</h4>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{cardA?.grade || "PSA 10"} • ${valA} USDC</div>
                  {cashFromA > 0 && (
                    <div className="text-[10px] text-emerald-700 font-mono font-medium mt-1">
                      + ${cashFromA} USDC Cash Added
                    </div>
                  )}
                </div>
              </div>

              {/* Card B */}
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 flex items-center gap-3 shadow-sm">
                {cardB?.image_url && (
                  <img src={cardB.image_url} alt={cardB.name} className="w-14 h-18 object-contain rounded-lg bg-neutral-50 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-emerald-800 font-semibold">{trade.vault_b_name}</div>
                  <h4 className="text-xs font-semibold text-neutral-900 truncate" title={cardB?.name}>{cardB?.name || "Physical Slab"}</h4>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{cardB?.grade || "PSA 10"} • ${valB} USDC</div>
                  {cashFromB > 0 && (
                    <div className="text-[10px] text-emerald-700 font-mono font-medium mt-1">
                      + ${cashFromB} USDC Cash Added
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Outcome message */}
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              isRejected ? "bg-rose-50 text-rose-800 border border-rose-200" : "bg-[#a8f0be]/25 text-[#053b2a] border border-[#a8f0be]/50"
            }`}>
              {isRejected ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Trade was declined by risk guardrails. Card ownership and balances were kept unchanged.</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Atomic parity settlement confirmed on NEAR Protocol. Fee: ${trade.protocol_fee_usdc || 0} USDC.</span>
                </>
              )}
            </div>
          </div>

          {/* Full Negotiation Dialogue Transcript */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <FileText className="w-3.5 h-3.5 text-[#053b2a]" />
              <span>Agent Conversation Transcript</span>
            </div>

            {Array.isArray(trade.negotiation_log) && trade.negotiation_log.length > 0 ? (
              <div className="space-y-2.5 font-mono text-xs">
                {trade.negotiation_log.map((turnItem, idx) => {
                  const turn = turnItem.turn || {};
                  const isAccept = turn.decision === "ACCEPT";
                  const isReject = turn.decision === "REJECT" || turn.decision === "REJECT_GUARDRAIL";
                  const cleanDialog = (turn.public_argument || "Offer presented.")
                    .replace(/\[NEP-413.*?\]/gs, "")
                    .replace(/Intent ID:.*?\n?/g, "")
                    .replace(/^["']|["']$/g, "")
                    .trim();

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isReject
                          ? "bg-rose-50/70 border-rose-200 text-rose-900"
                          : isAccept
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-[#fbfdfc] border-neutral-200 text-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 uppercase font-sans">
                            {turnItem.agent || `Round ${turnItem.round || idx + 1}`}
                          </span>
                          <span className="text-neutral-400 font-sans">Step {turnItem.round || idx + 1}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isAccept
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : isReject
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}>
                          {isAccept ? "DEAL AGREED" : isReject ? "DECLINED" : (turnItem.round === 1 ? "OPENING OFFER" : "COUNTER-OFFER")}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed font-sans text-neutral-800">
                        {cleanDialog}
                      </p>

                      {turn.private_reasoning_for_owner && (
                        <div className="mt-2 pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500 font-sans italic">
                          <span className="font-medium not-italic text-neutral-700">Note to Owner: </span>
                          &ldquo;{turn.private_reasoning_for_owner}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 text-neutral-500 text-xs text-center font-sans">
                Full negotiation transcript not recorded for this trade.
              </div>
            )}
          </div>

          {/* Cryptographic Transaction Details */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs font-mono space-y-1.5 text-neutral-600">
            <div className="flex items-center justify-between">
              <span>Transaction Hash:</span>
              <span className="text-neutral-900 font-medium truncate max-w-[240px] sm:max-w-xs">{trade.tx_hash}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Settlement Network:</span>
              <span className="text-neutral-900 font-medium">NEAR Protocol Testnet</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
