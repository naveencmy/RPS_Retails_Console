import { useState, useEffect, useRef } from "react";
import { ArrowRight, Terminal, Activity, Database, Clock, Cpu, MemoryStick, Thermometer, Wifi, WifiOff, Box, ShoppingCart, Package, AlertTriangle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { SystemAPI } from "@/lib/api";

const TERMINAL_LINES = [
  "> SYSTEM_BOOT SEQUENCE INITIATED...",
  "> LOADING KERNEL MODULES............ OK",
  "> MOUNTING FILESYSTEMS.............. OK",
  "> STARTING DATABASE ENGINE.......... OK",
  "> ENCRYPTION LAYER ACTIVE.......... OK",
  "> NETWORK BRIDGE ESTABLISHED....... OK",
  "> POS CORE SERVICES ONLINE......... OK",
  "> ALL SYSTEMS OPERATIONAL",
];

export default function CommandCenter() {
  const { currentUser } = useAuth();
  const [system, setSystem] = useState(null);
  const [dbOk, setDbOk] = useState(null);
  const [lanOk, setLanOk] = useState(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const cursorRef = useRef(null);

  // Fetch system data
  useEffect(() => {
    const fetchSystem = async () => {
      try {
        const data = await SystemAPI.info();
        setSystem(data);
        setDbOk(data.db?.status === "optimal");
        setLanOk(true);
      } catch {
        setLanOk(false);
        setDbOk(false);
      }
    };
    fetchSystem();
    const interval = setInterval(fetchSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  // Terminal line animation
  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) return;
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), 400);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = cursorRef.current.style.opacity === "0" ? "1" : "0";
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Live uptime counter (ticks every second from server start time)
  const [liveUptime, setLiveUptime] = useState("--");
  useEffect(() => {
    if (!system?.uptime) return;
    let totalSec = system.uptime.total_seconds;
    const tick = () => {
      totalSec++;
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      setLiveUptime(`${d}D ${String(h).padStart(2, "0")}H ${String(m).padStart(2, "0")}M`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [system]);

  const uptime = liveUptime;
  const dbStatus = dbOk === null ? "CHECKING" : dbOk ? "OPTIMAL" : "ERROR";
  const lanStatus = lanOk === null ? "CHECKING" : lanOk ? "CONNECTED" : "OFFLINE";
  const memUsed = system?.memory?.used_mb ? `${(system.memory.used_mb / 1024).toFixed(1)}GB` : "--";
  const memTotal = system?.memory?.total_mb ? `${(system.memory.total_mb / 1024).toFixed(0)}GB` : "--";
  const productCount = system?.counts?.products ?? "--";
  const partyCount = system?.counts?.parties ?? "--";
  const lowStock = system?.counts?.low_stock ?? "--";
  const todaySales = system?.counts?.today_sales ?? "--";
  const todayPurchases = system?.counts?.today_purchases ?? "--";

  return (
    <Layout>
      <div className="space-y-0">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr] min-h-[calc(100vh-8rem)]">

          {/* ── LEFT PANEL ─────────────────────────── */}
          <div className="rounded-none border border-border bg-card p-8 shadow-sm">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-5">
              GRIDIRON_OPERATING_SYSTEM_V.2.4.0
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl lg:text-7xl font-black leading-none tracking-tight text-primary">
                COMMAND
              </h1>
              <h2 className="text-5xl lg:text-7xl font-black leading-none tracking-tight text-primary">
                POS
              </h2>
            </div>

            {/* System Telemetry */}
            <div className="mt-8 space-y-6">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                SYSTEM_TELEMETRY
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* LAN Status */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">LAN_STATUS</div>
                  <div className="flex items-center gap-2">
                    {lanOk ? (
                      <Wifi className="w-5 h-5 text-[hsl(var(--success))]" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-[hsl(var(--error))]" />
                    )}
                    <span className="text-xl font-black text-foreground tracking-wider">
                      LAN: {lanStatus}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className={`h-1 w-8 rounded-sm ${lanOk ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--error))]"}`} />
                    <div className={`h-1 w-8 rounded-sm ${lanOk ? "bg-[hsl(var(--success))]" : "bg-muted"}`} />
                    <div className={`h-1 w-8 rounded-sm ${lanOk ? "bg-[hsl(var(--success))]" : "bg-muted"}`} />
                  </div>
                </div>

                {/* Database Status */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">DATABASE_STATE</div>
                  <div className="flex items-center gap-2">
                    <Database className={`w-5 h-5 ${dbOk ? "text-[hsl(var(--success))]" : "text-[hsl(var(--error))]"}`} />
                    <span className="text-xl font-black text-foreground tracking-wider">
                      DB: {dbStatus}
                    </span>
                  </div>
                  <div className={`h-1 w-24 rounded-sm mt-2 ${dbOk ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--error))]"}`} />
                  {system?.db?.latency_ms != null && (
                    <div className="text-[10px] text-muted-foreground mt-1">Latency: {system.db.latency_ms}ms</div>
                  )}
                </div>
              </div>

              {/* Uptime */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">UPTIME_COUNTER</div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-wider">
                    UPTIME: {uptime}
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal Animation */}
            <div className="mt-8 rounded-lg bg-black border border-border p-4 font-mono text-xs overflow-hidden max-h-48">
              {TERMINAL_LINES.map((line, i) =>
                i < visibleLines ? (
                  <div key={i} className={i === TERMINAL_LINES.length - 1 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--success))]/70"}>
                    {line}
                  </div>
                ) : null
              )}
              {visibleLines >= TERMINAL_LINES.length && (
                <div className="flex items-center gap-1 text-[hsl(var(--success))]">
                  <span>{">"}</span>
                  <span>WAITING FOR USER INPUT</span>
                  <span ref={cursorRef} className="inline-block w-2 h-3 bg-[hsl(var(--success))]" />
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                SYSTEM_LIVE
              </span>
              <span>/</span>
              <span>ENCRYPTION: AES_256</span>
              <span>/</span>
              <span>ZONE: EAST_01</span>
            </div>
          </div>

          {/* ── RIGHT PANEL ─────────────────────────── */}
          <div className="flex flex-col">
            {/* Login to Terminal */}
            <Link
              to="/sales"
              className="flex items-center justify-between bg-primary hover:bg-primary/90 transition p-8 min-h-[200px] group"
            >
              <div className="flex items-center gap-4">
                <Terminal className="w-10 h-10 text-primary-foreground" />
                <div>
                  <div className="text-2xl font-black text-primary-foreground tracking-wider">
                    LOGIN TO
                  </div>
                  <div className="text-2xl font-black text-primary-foreground tracking-wider">
                    TERMINAL
                  </div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mt-1">
                    ACCESS_LEVEL: {currentUser?.role?.toUpperCase() || "OPERATOR"}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-8 h-8 text-primary-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* System Diagnostics */}
            <div className="border border-border bg-card p-6 flex-1">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                SYSTEM DIAGNOSTICS
              </div>
              <div className="text-[10px] text-muted-foreground mb-4 font-mono">
                RUN_DEEP_SCAN_V1.0
              </div>

              <div className="space-y-3">
                <DiagnosticRow icon={Box} label="Products" value={productCount} />
                <DiagnosticRow icon={Users} label="Parties" value={partyCount} />
                <DiagnosticRow icon={AlertTriangle} label="Low Stock" value={lowStock} accent="warning" />
                <DiagnosticRow icon={ShoppingCart} label="Today Sales" value={todaySales} />
                <DiagnosticRow icon={Package} label="Today Purchases" value={todayPurchases} />
                <DiagnosticRow icon={MemoryStick} label="Memory" value={`${memUsed} / ${memTotal}`} />
                <DiagnosticRow icon={Cpu} label="Heap" value={system?.memory ? `${system.memory.used_mb}MB` : "--"} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER BAR ──────────────────────────── */}
        <div className="border border-border bg-card px-6 py-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>
              <Cpu className="w-3 h-3 inline mr-1" />
              HEAP: {memUsed}
            </span>
            <span>
              <MemoryStick className="w-3 h-3 inline mr-1" />
              MEM: {memUsed} / {memTotal}
            </span>
            <span>
              <Database className="w-3 h-3 inline mr-1" />
              DB_LATENCY: {system?.db?.latency_ms ?? "--"}ms
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[hsl(var(--success))]">READY_STATE_CMD</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-1.5 h-3 bg-primary rounded-sm" style={{ height: `${6 + i * 2}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DiagnosticRow({ icon: Icon, label, value, accent }) {
  const valueClass = accent === "warning"
    ? "text-[hsl(var(--warning))]"
    : "text-foreground";

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
