"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";
import { 
  Server, 
  Layers, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Terminal,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

export default function Home() {
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [socketId, setSocketId] = useState(null);
  const [apiStatus, setApiStatus] = useState({ checking: true, ok: false, data: null });
  const [pingLatency, setPingLatency] = useState(null);

  const checkApi = async () => {
    setApiStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await api.get("/health");
      setApiStatus({ checking: false, ok: true, data: res.data });
    } catch (err) {
      setApiStatus({ checking: false, ok: false, data: { error: err.message } });
    }
  };

  useEffect(() => {
    checkApi();

    const socket = getSocket();

    const onConnect = () => {
      setSocketStatus("connected");
      setSocketId(socket.id);
    };

    const onDisconnect = () => {
      setSocketStatus("disconnected");
      setSocketId(null);
    };

    const onConnectedMsg = (data) => {
      if (data?.socketId) setSocketId(data.socketId);
    };

    const onPong = (data) => {
      if (data?.timestamp) {
        setPingLatency(Date.now() - data.timestamp);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connected", onConnectedMsg);
    socket.on("pong", onPong);

    if (socket.connected) {
      setSocketStatus("connected");
      setSocketId(socket.id);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connected", onConnectedMsg);
      socket.off("pong", onPong);
    };
  }, []);

  const sendPing = () => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("ping");
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto w-full">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[250px] bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Poke Agent</h1>
            <p className="text-xs text-slate-400">pnpm Monorepo • Next.js & Express ESM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            socketStatus === "connected"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              socketStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`} />
            Socket: {socketStatus}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Express Backend</h2>
              </div>
              <button 
                onClick={checkApi} 
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-3 h-3 ${apiStatus.checking ? "animate-spin" : ""}`} />
                Test API
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              ES Modules mimarisinde, PostgreSQL & Sequelize ORM, JWT authentication ve Socket.IO altyapısı hazır.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">API Health (/health):</span>
                <span className="flex items-center gap-1 font-mono">
                  {apiStatus.checking ? (
                    <span className="text-slate-400">Kontrol ediliyor...</span>
                  ) : apiStatus.ok ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Online (200 OK)</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Offline (Port: 5001)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Socket.IO Durumu:</span>
                <span className="font-mono text-slate-300">
                  {socketId ? `${socketId.substring(0, 12)}...` : "Bağlantı bekleniyor"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Port: <code className="text-indigo-400 font-mono">5001</code></span>
            <button
              onClick={sendPing}
              disabled={socketStatus !== "connected"}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium transition"
            >
              Socket Ping Gönder {pingLatency !== null && `(${pingLatency}ms)`}
            </button>
          </div>
        </div>

        {/* Frontend Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Next.js Frontend</h2>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Next.js App Router, Tailwind CSS v4, Lucide Icons, Axios ve Socket.IO Client ile yapılandırıldı.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Monorepo Yöneticisi:</span>
                <span className="font-mono text-cyan-300 font-medium">pnpm (Workspaces)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Stil Motoru:</span>
                <span className="font-mono text-slate-300">Tailwind CSS v4</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Port: <code className="text-cyan-400 font-mono">3000</code></span>
            <span className="text-xs text-slate-400 font-mono">@/* path alias aktif</span>
          </div>
        </div>
      </div>

      {/* Terminal / Quick Run Helper */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Geliştirme Komutları (Kök dizinden):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-300 mt-2">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Her ikisini aynı anda çalıştır</div>
            <code className="text-indigo-400 font-bold">pnpm dev</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Sadece Backend</div>
            <code className="text-indigo-400 font-bold">pnpm dev:backend</code>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Sadece Frontend</div>
            <code className="text-indigo-400 font-bold">pnpm dev:frontend</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Poke Agent Monorepo Kurulumu Tamamlandı</span>
        </div>
        <span>Node.js v22 • pnpm v12</span>
      </footer>
    </main>
  );
}
