import { useEffect, useMemo, useState } from "react";
import { api, type DashboardStats, type GenerationResponse, type Project } from "./lib/api";
import {
  LayoutDashboard, FileText, Film, Library, CalendarDays, FolderOpen, BarChart2, Settings,
  Search, Plus, Bell, Sparkles, Wand2, RefreshCw, Loader2, Clipboard, Check, AlertCircle,
  MessageSquareText, Layers, Hash, ListChecks, WandSparkles, ArrowRight, BookOpen, Clock,
  TrendingUp, Target, Lightbulb, PenLine, X, Zap, Rocket, Eye, CalendarPlus, SlidersHorizontal,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", desc: "Ringkasan workflow" },
  { icon: FileText, label: "Generate Script", desc: "Buat konten AI" },
  { icon: Film, label: "Storyboard", desc: "Lihat scene" },
  { icon: Library, label: "Prompt Library", desc: "Template prompt" },
  { icon: CalendarDays, label: "Content Calendar", desc: "Jadwal konten" },
  { icon: FolderOpen, label: "Projects", desc: "Daftar project" },
  { icon: BarChart2, label: "Analytics", desc: "Statistik" },
];

const PLATFORMS = ["TikTok", "YouTube Shorts", "Instagram Reels", "Novel", "Blog"];
const TONES = ["Cinematic", "Motivational", "Strategic", "Emotional", "Funny"];

const IDEA_PRESETS = [
  "Pola pikir Lelouch untuk mahasiswa yang ingin menang dalam hidup",
  "Compounding interest dan Psychology of Money untuk anak muda",
  "Fang Yuan dan seni memahami insentif manusia",
  "Rudeus Greyrat dan konsep membangun jiwa baru",
  "Cara mahasiswa membangun skill yang bisa dijual",
  "Penyesalan sebagai bahan bakar mental yang lebih kuat",
];

const PROMPT_TEMPLATES = [
  { title: "Strategic Short Script", tag: "YouTube Shorts", prompt: "Buat naskah video pendek 45 detik dengan hook tajam, 3 insight strategis, dan CTA yang natural." },
  { title: "Anime Mindset Breakdown", tag: "TikTok", prompt: "Bedah pola pikir karakter anime, ambil pelajaran praktis untuk mahasiswa, gunakan bahasa emosional tapi tetap realistis." },
  { title: "Novel Promo Trailer", tag: "Novel", prompt: "Buat narasi trailer novel fantasi dengan visual sinematik, konflik utama, dan ending yang menggantung." },
  { title: "Visual Prompt Pack", tag: "AI Image", prompt: "Ubah naskah menjadi 5 prompt visual yang konsisten dari segi mood, lighting, dan komposisi." },
];

const CALENDAR_ITEMS = [
  { day: "Mon", task: "Script", note: "Buat naskah", from: "#6d28d9", to: "#7c3aed" },
  { day: "Wed", task: "Edit", note: "Rakit visual", from: "#0e7490", to: "#06b6d4" },
  { day: "Fri", task: "Upload", note: "Posting konten", from: "#065f46", to: "#10b981" },
  { day: "Sun", task: "Review", note: "Cek performa", from: "#92400e", to: "#f59e0b" },
];

const EMPTY_STATS: DashboardStats = {
  total_projects: 0,
  scripts_generated: 0,
  storyboards_created: 0,
  content_scheduled: 0,
  best_performing_tone: "Strategic",
  recommended_upload_time: "19:30",
  weekly_focus: "Create 3 short videos and 1 story chapter",
};

type OutputTab = "Script" | "Storyboard" | "Prompts" | "Caption" | "Checklist";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copyText = async () => {
    await navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button type="button" onClick={copyText} className="inline-flex items-center gap-1.5 text-[11px] text-[#a5b4fc] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg px-2.5 py-1.5 transition-all">
      {copied ? <Check size={12} /> : <Clipboard size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.14em] mb-2">CreatorForge AI</p>
        <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
        <p className="text-sm text-[#8ea0d5] mt-2 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function SelectPill({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#080b18] border border-[rgba(99,102,241,0.18)] rounded-xl px-4 py-3 text-sm text-[#dbe4ff] focus:outline-none focus:border-violet-500/50">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function SectionCard({ title, icon: Icon, children, copyText }: { title: string; icon: typeof FileText; children: React.ReactNode; copyText?: string }) {
  return (
    <div className="rounded-2xl bg-[#080b18]/70 border border-[rgba(99,102,241,0.14)] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-300"><Icon size={14} /></div>
          <h3 className="text-[13px] font-semibold text-white">{title}</h3>
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="text-[13px] text-[#c4cde8] leading-relaxed">{children}</div>
    </div>
  );
}

function statusStyle(status?: string | null) {
  const normalized = (status || "Draft").toLowerCase();
  if (normalized === "published") return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25";
  if (normalized === "scheduled") return "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25";
  return "bg-violet-500/15 text-violet-300 border border-violet-500/25";
}

function formatGenerationForCopy(generation: GenerationResponse | null) {
  if (!generation) return "";
  const blocks = [
    generation.title ? `Title:\n${generation.title}` : "",
    generation.hook ? `Hook:\n${generation.hook}` : "",
    generation.script ? `Script:\n${generation.script}` : "",
    generation.caption ? `Caption:\n${generation.caption}` : "",
    generation.hashtags?.length ? `Hashtags:\n${generation.hashtags.join(" ")}` : "",
  ].filter(Boolean);
  return blocks.join("\n\n");
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [platform, setPlatform] = useState("TikTok");
  const [tone, setTone] = useState("Strategic");
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);
  const [generations, setGenerations] = useState<GenerationResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [activeOutputTab, setActiveOutputTab] = useState<OutputTab>("Script");

  const refreshDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const [statsData, projectData, generationData] = await Promise.all([api.getStats(), api.getProjects(), api.getGenerations()]);
      setStats(statsData);
      setProjects(projectData);
      setGenerations(generationData);
      if (!generatedContent && generationData.length > 0) setGeneratedContent(generationData[0]);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengambil data dari backend.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => { refreshDashboard(); }, []);

  const statsCards = useMemo(() => [
    { label: "Total Projects", value: stats.total_projects, icon: FolderOpen, color: "#a78bfa" },
    { label: "Scripts Generated", value: stats.scripts_generated, icon: FileText, color: "#22d3ee" },
    { label: "Storyboards Created", value: stats.storyboards_created, icon: Film, color: "#818cf8" },
    { label: "Content Scheduled", value: stats.content_scheduled, icon: CalendarDays, color: "#34d399" },
  ], [stats]);

  const goToGenerator = (preset?: string) => {
    if (preset) setIdea(preset);
    setActiveNav("Generate Script");
  };

  const handleGenerate = async () => {
    if (generating) return;
    if (!idea.trim()) {
      setErrorMessage("Isi ide kontennya dulu ya. Klik quick idea kalau lagi blank.");
      setActiveNav("Generate Script");
      return;
    }

    try {
      setGenerating(true);
      setGeneratedContent(null);
      setErrorMessage("");
      setActiveOutputTab("Script");
      const result = await api.generateContent({ idea: idea.trim(), platform, tone, language: "Indonesian" });
      setGeneratedContent(result);
      setGenerations((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);
      setActiveNav("Generate Script");
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Gagal connect ke backend.");
    } finally {
      setGenerating(false);
    }
  };

  const GeneratorPanel = () => (
    <div className="grid grid-cols-[0.9fr,1.1fr] gap-5 items-start">
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "#0f1225", border: "1px solid rgba(99,102,241,0.18)" }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}><Zap size={15} className="text-white" /></div>
          <div><h2 className="text-sm font-semibold text-white">AI Content Generator</h2><p className="text-[11px] text-[#6b7db3] mt-0.5">Workflow utama. Isi ide, pilih gaya, lalu generate.</p></div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-[#c4cde8] mb-2 block">Content idea</label>
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Contoh: Pola pikir Lelouch untuk mahasiswa yang ingin menang dalam hidup..." className="w-full min-h-[130px] resize-none bg-[#080b18] border border-[rgba(99,102,241,0.18)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4f5f91] focus:outline-none focus:border-violet-500/50 leading-relaxed" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[12px] font-semibold text-[#c4cde8] mb-2 block">Platform</label><SelectPill value={platform} options={PLATFORMS} onChange={setPlatform} /></div>
            <div><label className="text-[12px] font-semibold text-[#c4cde8] mb-2 block">Tone</label><SelectPill value={tone} options={TONES} onChange={setTone} /></div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#c4cde8] mb-2">Quick ideas</p>
            <div className="grid grid-cols-1 gap-2">
              {IDEA_PRESETS.slice(0, 4).map((preset) => <button key={preset} onClick={() => setIdea(preset)} className="text-left text-[12px] text-[#a5b4fc] hover:text-white bg-[#080b18] hover:bg-white/[0.05] border border-[rgba(99,102,241,0.12)] hover:border-violet-500/30 rounded-xl px-3 py-2 transition-all">{preset}</button>)}
            </div>
          </div>
          {errorMessage && <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/25 flex items-start gap-3"><AlertCircle size={16} className="text-red-300 mt-0.5" /><p className="text-[12px] text-red-100 leading-relaxed whitespace-pre-line">{errorMessage}</p></div>}
          <button onClick={handleGenerate} disabled={generating} className="w-full flex items-center justify-center gap-2 text-white text-[13px] font-semibold px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-70 hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? "Generating content..." : "Generate Content"}
          </button>
        </div>
      </div>
      <ResultPanel />
    </div>
  );

  const ResultPanel = () => {
    const tabs: { label: OutputTab; icon: typeof FileText; disabled: boolean }[] = [
      { label: "Script", icon: MessageSquareText, disabled: !generatedContent?.script && !generatedContent?.hook },
      { label: "Storyboard", icon: Layers, disabled: !generatedContent?.storyboard?.length },
      { label: "Prompts", icon: WandSparkles, disabled: !generatedContent?.visual_prompts?.length },
      { label: "Caption", icon: Hash, disabled: !generatedContent?.caption && !generatedContent?.hashtags?.length },
      { label: "Checklist", icon: ListChecks, disabled: !generatedContent?.editing_checklist?.length },
    ];
    return (
      <div className="rounded-2xl p-5 relative overflow-hidden min-h-[560px]" style={{ background: "#0f1225", border: "1px solid rgba(99,102,241,0.18)" }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div><h2 className="text-sm font-semibold text-white">Generated Result</h2><p className="text-[11px] text-[#6b7db3] mt-0.5">Output dipisah supaya gampang dicopy dan dipakai.</p></div>
          {generatedContent && <CopyButton text={formatGenerationForCopy(generatedContent)} label="Copy all" />}
        </div>
        {generating && <div className="h-[470px] rounded-2xl bg-[#080b18]/60 border border-white/10 flex flex-col items-center justify-center text-center px-10"><Loader2 size={34} className="animate-spin text-violet-300 mb-4" /><p className="text-sm font-semibold text-white">AI sedang menempa kontenmu</p><p className="text-[12px] text-[#6b7db3] mt-2">Tunggu sampai hasilnya muncul. Jangan klik berulang, nanti AI-nya ikut panik.</p></div>}
        {!generating && !generatedContent && <div className="h-[470px] rounded-2xl bg-[#080b18]/60 border border-dashed border-[rgba(99,102,241,0.25)] flex flex-col items-center justify-center text-center px-10"><Eye size={34} className="text-[#6b7db3] mb-4" /><p className="text-sm font-semibold text-white">Belum ada output</p><p className="text-[12px] text-[#6b7db3] mt-2">Isi ide lalu klik Generate Content. Hasilnya akan tampil di sini.</p></div>}
        {!generating && generatedContent && (
          <div>
            <div className="rounded-2xl bg-[#080b18]/70 border border-[rgba(99,102,241,0.14)] p-4 mb-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-[#6b7db3] uppercase tracking-[0.12em] mb-1">Current output</p><h3 className="text-base font-bold text-white leading-snug">{generatedContent.title || generatedContent.idea}</h3><p className="text-[12px] text-[#6b7db3] mt-1">{generatedContent.platform} · {generatedContent.tone}</p></div><button onClick={() => setGeneratedContent(null)} className="text-[#6b7db3] hover:text-white"><X size={15} /></button></div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {tabs.map(({ label, icon: Icon, disabled }) => <button key={label} disabled={disabled} onClick={() => setActiveOutputTab(label)} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${activeOutputTab === label ? "bg-violet-500/20 text-white border-violet-500/35" : "bg-white/[0.03] text-[#a5b4fc] border-white/10 hover:bg-white/[0.06]"}`}><Icon size={13} /> {label}</button>)}
            </div>
            <div className="max-h-[365px] overflow-y-auto pr-1 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activeOutputTab === "Script" && <>{generatedContent.hook && <SectionCard title="Hook" icon={PenLine} copyText={generatedContent.hook}><p>{generatedContent.hook}</p></SectionCard>}{generatedContent.script && <SectionCard title="Script" icon={MessageSquareText} copyText={generatedContent.script}><p className="whitespace-pre-line">{generatedContent.script}</p></SectionCard>}</>}
              {activeOutputTab === "Storyboard" && generatedContent.storyboard && <SectionCard title="Storyboard" icon={Layers} copyText={generatedContent.storyboard.map((item) => `Scene ${item.scene}\nVisual: ${item.visual}\nVoice over: ${item.voice_over}\nEditing note: ${item.editing_note}`).join("\n\n")}><div className="space-y-3">{generatedContent.storyboard.map((item) => <div key={item.scene} className="rounded-xl bg-black/20 border border-white/5 p-3"><p className="font-semibold text-white/90 mb-1">Scene {item.scene}</p><p><span className="text-cyan-300">Visual:</span> {item.visual}</p><p><span className="text-cyan-300">Voice over:</span> {item.voice_over}</p><p><span className="text-cyan-300">Editing note:</span> {item.editing_note}</p></div>)}</div></SectionCard>}
              {activeOutputTab === "Prompts" && generatedContent.visual_prompts && <SectionCard title="Visual Prompts" icon={WandSparkles} copyText={generatedContent.visual_prompts.join("\n\n")}><div className="space-y-2">{generatedContent.visual_prompts.map((prompt, index) => <p key={`${prompt}-${index}`} className="rounded-xl bg-black/20 border border-white/5 p-3">{prompt}</p>)}</div></SectionCard>}
              {activeOutputTab === "Caption" && <>{generatedContent.caption && <SectionCard title="Caption" icon={Hash} copyText={generatedContent.caption}><p>{generatedContent.caption}</p></SectionCard>}{generatedContent.hashtags?.length ? <SectionCard title="Hashtags" icon={Hash} copyText={generatedContent.hashtags.join(" ")}><p>{generatedContent.hashtags.join(" ")}</p></SectionCard> : null}</>}
              {activeOutputTab === "Checklist" && generatedContent.editing_checklist && <SectionCard title="Editing Checklist" icon={ListChecks} copyText={generatedContent.editing_checklist.join("\n")}><ul className="space-y-2">{generatedContent.editing_checklist.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><Check size={14} className="text-emerald-300 mt-0.5 flex-shrink-0" /> <span>{item}</span></li>)}</ul></SectionCard>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const DashboardPage = () => (
    <>
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #1a0f3e 0%, #0f1635 50%, #071830 100%)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 8px 32px rgba(124,58,237,0.12)" }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        <div className="relative z-10 flex items-start justify-between gap-8">
          <div><p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.12em] mb-2">Dashboard</p><h1 className="text-[24px] font-bold text-white leading-tight mb-2">Buat konten dari ide mentah sampai siap upload</h1><p className="text-[#a5b4fc] text-sm leading-relaxed max-w-xl">Sekarang sidebar sudah aktif. Klik menu kiri untuk pindah halaman dan menjalankan workflow yang berbeda.</p><div className="flex items-center gap-3 mt-4"><button onClick={() => goToGenerator()} className="flex items-center gap-2 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}><Wand2 size={14} /> Generate Now</button><button onClick={() => goToGenerator(IDEA_PRESETS[0])} className="flex items-center gap-2 text-white text-[13px] font-medium px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10"><Rocket size={14} /> Use Example Idea</button></div></div>
          <div className="hidden xl:grid grid-cols-2 gap-2 min-w-[260px]">{["1. Idea", "2. Generate", "3. Copy", "4. Publish"].map((item) => <div key={item} className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/10 text-[12px] font-medium text-white/80">{item}</div>)}</div>
        </div>
      </div>
      <StatsGrid />
      <div className="grid grid-cols-2 gap-5"><RecentProjects compact /><RecentGenerations compact /></div>
    </>
  );

  const StatsGrid = () => (
    <div className="grid grid-cols-4 gap-4">
      {statsCards.map(({ label, value, icon: Icon, color }) => <button key={label} onClick={() => setActiveNav(label === "Total Projects" ? "Projects" : label === "Content Scheduled" ? "Content Calendar" : label === "Storyboards Created" ? "Storyboard" : "Analytics")} className="text-left rounded-2xl p-4 relative overflow-hidden hover:scale-[1.03] transition-transform" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.22)" }}><div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-black/30" style={{ color }}><Icon size={16} /></div><p className="text-[26px] font-bold text-white leading-none">{value}</p><p className="text-[11px] mt-1.5 font-medium text-[#6b7db3]">{label}</p></button>)}
    </div>
  );

  const RecentProjects = ({ compact = false }: { compact?: boolean }) => (
    <div>
      <div className="flex items-center justify-between mb-3"><h2 className="text-[13px] font-semibold text-white">Recent Projects</h2>{compact && <button onClick={() => setActiveNav("Projects")} className="text-[12px] text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ArrowRight size={12} /></button>}</div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1225", border: "1px solid rgba(99,102,241,0.18)" }}>
        {projects.length === 0 ? <div className="p-6 text-center"><FolderOpen size={26} className="text-[#6b7db3] mx-auto mb-2" /><p className="text-sm text-white font-semibold">Belum ada project</p><p className="text-[12px] text-[#6b7db3] mt-1">Generate konten dulu, lalu data project akan muncul di sini.</p></div> : projects.slice(0, compact ? 5 : 20).map((proj) => <div key={proj.id} className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[rgba(99,102,241,0.07)] last:border-0 hover:bg-white/[0.025]"><div className="min-w-0"><p className="text-[13px] text-white font-medium truncate">{proj.title}</p><p className="text-[11px] text-[#6b7db3] mt-0.5">{proj.platform || "No platform"}</p></div><span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap ${statusStyle(proj.status)}`}>{proj.status || "Draft"}</span></div>)}
      </div>
    </div>
  );

  const RecentGenerations = ({ compact = false }: { compact?: boolean }) => (
    <div>
      <div className="flex items-center justify-between mb-3"><h2 className="text-[13px] font-semibold text-white">Recent Generations</h2><button onClick={refreshDashboard} className="text-[12px] text-violet-400 hover:text-violet-300 flex items-center gap-1">Refresh <RefreshCw size={12} /></button></div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1225", border: "1px solid rgba(99,102,241,0.18)" }}>
        {generations.length === 0 ? <div className="p-6 text-center"><Sparkles size={26} className="text-[#6b7db3] mx-auto mb-2" /><p className="text-sm text-white font-semibold">Belum ada hasil AI</p><p className="text-[12px] text-[#6b7db3] mt-1">Output terbaru akan masuk ke sini otomatis.</p></div> : generations.slice(0, compact ? 5 : 20).map((item) => <button key={item.id} onClick={() => { setGeneratedContent(item); setActiveOutputTab("Script"); setActiveNav("Generate Script"); }} className="w-full text-left flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[rgba(99,102,241,0.07)] last:border-0 hover:bg-white/[0.025] group"><div className="min-w-0"><p className="text-[13px] text-white font-medium truncate group-hover:text-violet-300">{item.title || item.idea}</p><p className="text-[11px] text-[#6b7db3] mt-0.5">{item.platform} · {item.tone}</p></div><ArrowRight size={13} className="text-[#6b7db3]" /></button>)}
      </div>
    </div>
  );

  const renderPage = () => {
    if (activeNav === "Dashboard") return <DashboardPage />;
    if (activeNav === "Generate Script") return <><PageHeader title="Generate Script" subtitle="Tulis ide konten, pilih platform, lalu ambil script, storyboard, prompt visual, caption, dan checklist editing." /><GeneratorPanel /></>;
    if (activeNav === "Storyboard") return <><PageHeader title="Storyboard" subtitle="Lihat scene dari hasil generate terakhir. Kalau belum ada output, generate script dulu." action={<button onClick={() => goToGenerator()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500">Generate Storyboard</button>} />{generatedContent?.storyboard?.length ? <div className="grid grid-cols-2 gap-4">{generatedContent.storyboard.map((item) => <div key={item.scene} className="rounded-2xl p-5 bg-[#0f1225] border border-[rgba(99,102,241,0.18)]"><p className="text-violet-300 text-xs font-bold mb-2">Scene {item.scene}</p><p className="text-white text-sm font-semibold mb-2">{item.visual}</p><p className="text-[#a5b4fc] text-sm mb-2">{item.voice_over}</p><p className="text-[#6b7db3] text-xs">Editing: {item.editing_note}</p></div>)}</div> : <EmptyPage icon={Film} title="Belum ada storyboard" text="Klik Generate Storyboard untuk membuat output yang bisa dipakai." action={() => goToGenerator()} />}</>;
    if (activeNav === "Prompt Library") return <><PageHeader title="Prompt Library" subtitle="Template prompt siap pakai. Klik Use Template untuk mengisi generator." /><div className="grid grid-cols-2 gap-4">{PROMPT_TEMPLATES.map((item) => <div key={item.title} className="rounded-2xl p-5 bg-[#0f1225] border border-[rgba(99,102,241,0.18)]"><div className="flex items-center justify-between mb-3"><h3 className="text-white font-semibold">{item.title}</h3><span className="text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2 py-1">{item.tag}</span></div><p className="text-sm text-[#a5b4fc] leading-relaxed mb-4">{item.prompt}</p><button onClick={() => goToGenerator(item.prompt)} className="text-sm text-violet-300 hover:text-white flex items-center gap-2">Use Template <ArrowRight size={13} /></button></div>)}</div></>;
    if (activeNav === "Content Calendar") return <><PageHeader title="Content Calendar" subtitle="Jadwal sederhana agar workflow konten tidak berhenti di ide saja." action={<button onClick={() => goToGenerator()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 flex items-center gap-2"><CalendarPlus size={14} /> New Content</button>} /><div className="grid grid-cols-4 gap-4">{CALENDAR_ITEMS.map(({ day, task, note, from, to }) => <div key={day} className="rounded-2xl p-5 relative overflow-hidden min-h-[170px]" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}><div className="absolute inset-0 bg-black/25" /><div className="relative z-10"><p className="text-white/70 text-xs uppercase tracking-widest">{day}</p><h3 className="text-white text-xl font-bold mt-3">{task}</h3><p className="text-white/75 text-sm mt-2">{note}</p></div></div>)}</div></>;
    if (activeNav === "Projects") return <><PageHeader title="Projects" subtitle="Semua project yang tersimpan dari backend." /><RecentProjects /></>;
    if (activeNav === "Analytics") return <><PageHeader title="Analytics" subtitle="Ringkasan performa workflow. Untuk sekarang ini berbasis data backend yang tersedia." /><StatsGrid /><div className="grid grid-cols-2 gap-5"><RecentGenerations /><div className="rounded-2xl p-5 bg-[#0f1225] border border-[rgba(99,102,241,0.18)]"><h2 className="text-white font-semibold mb-4">Insight</h2><div className="space-y-3 text-sm text-[#c4cde8]"><p>Best tone: <span className="text-violet-300 font-semibold">{stats.best_performing_tone}</span></p><p>Recommended upload time: <span className="text-cyan-300 font-semibold">{stats.recommended_upload_time}</span></p><p>Weekly focus: <span className="text-emerald-300 font-semibold">{stats.weekly_focus}</span></p></div></div></div></>;
    if (activeNav === "Settings") return <><PageHeader title="Settings" subtitle="Konfigurasi dasar aplikasi dan koneksi backend." /><div className="rounded-2xl p-5 bg-[#0f1225] border border-[rgba(99,102,241,0.18)] space-y-4"><div className="flex items-center gap-3"><SlidersHorizontal className="text-violet-300" /><div><p className="text-white font-semibold">API Backend</p><p className="text-sm text-[#8ea0d5]">Frontend membaca URL dari VITE_API_URL di file .env.</p></div></div><button onClick={refreshDashboard} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500">Test Refresh Data</button></div></>;
    return <DashboardPage />;
  };

  function EmptyPage({ icon: Icon, title, text, action }: { icon: typeof Film; title: string; text: string; action: () => void }) {
    return <div className="h-[420px] rounded-2xl bg-[#0f1225] border border-dashed border-[rgba(99,102,241,0.25)] flex flex-col items-center justify-center text-center px-10"><Icon size={36} className="text-[#6b7db3] mb-4" /><p className="text-base font-semibold text-white">{title}</p><p className="text-sm text-[#6b7db3] mt-2 mb-5">{text}</p><button onClick={action} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500">Open Generator</button></div>;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#080b18] text-[#e8eaf6]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <aside className="w-[236px] flex-shrink-0 flex flex-col bg-[#0a0d1f] border-r border-[rgba(99,102,241,0.12)]">
        <div className="px-5 pt-5 pb-4 flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 0 18px rgba(124,58,237,0.45)" }}><Sparkles size={16} className="text-white" /></div><div><span className="font-bold text-sm tracking-tight text-white">CreatorForge<span className="text-violet-400"> AI</span></span><p className="text-[10px] text-[#6b7db3]">Content workflow studio</p></div></div>
        <div className="mx-4 h-px bg-[rgba(99,102,241,0.1)]" />
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label }) => { const active = activeNav === label; return <button key={label} onClick={() => setActiveNav(label)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${active ? "bg-[rgba(124,58,237,0.18)] text-white border border-[rgba(124,58,237,0.3)]" : "text-[#6b7db3] hover:text-[#c4cde8] hover:bg-white/[0.04]"}`}><Icon size={15} className={active ? "text-violet-400" : "text-current"} /><span>{label}</span>{active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />}</button>; })}
        </nav>
        <div className="mx-4 h-px bg-[rgba(99,102,241,0.1)]" />
        <div className="px-3 py-3"><button onClick={() => setActiveNav("Settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-3 ${activeNav === "Settings" ? "bg-[rgba(124,58,237,0.18)] text-white border border-[rgba(124,58,237,0.3)]" : "text-[#6b7db3] hover:text-[#c4cde8] hover:bg-white/[0.04]"}`}><Settings size={15} /> Settings</button><div className="p-3 rounded-xl flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #22d3ee)" }}>P</div><div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">Putra</p><p className="text-[10px] text-[#6b7db3] truncate">Builder Mode</p></div><span className="w-2 h-2 rounded-full bg-emerald-400" /></div></div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center gap-4 px-6 border-b border-[rgba(99,102,241,0.12)] bg-[#080b18]/90 backdrop-blur-sm flex-shrink-0">
          <div className="relative flex-1 max-w-[430px]"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7db3]" /><input type="text" placeholder="Search projects, scripts, prompts..." className="w-full bg-[#0f1225] border border-[rgba(99,102,241,0.15)] rounded-xl pl-9 pr-4 py-2 text-[13px] text-white placeholder:text-[#6b7db3] focus:outline-none focus:border-violet-500/50" /></div>
          <div className="flex items-center gap-2.5 ml-auto"><button onClick={() => goToGenerator()} className="flex items-center gap-2 text-white text-[13px] font-semibold px-4 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}><Plus size={14} /> New Content</button><button onClick={refreshDashboard} className="relative w-9 h-9 rounded-xl bg-[#0f1225] border border-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#6b7db3] hover:text-white">{loadingDashboard ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}</button><button className="relative w-9 h-9 rounded-xl bg-[#0f1225] border border-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#6b7db3] hover:text-white"><Bell size={15} /><span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" /></button></div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{renderPage()}</main>
          <aside className="w-[280px] flex-shrink-0 border-l border-[rgba(99,102,241,0.12)] bg-[#0a0d1f] overflow-y-auto px-4 py-5 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div><p className="text-[10px] font-semibold text-[#6b7db3] uppercase tracking-[0.12em] mb-3">Current Page</p><div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20"><p className="text-white text-sm font-semibold">{activeNav}</p><p className="text-[#8ea0d5] text-xs mt-1">Sidebar sekarang aktif. Klik menu untuk berpindah halaman.</p></div></div>
            <div><p className="text-[10px] font-semibold text-[#6b7db3] uppercase tracking-[0.12em] mb-3">Creative Insights</p><div className="space-y-2.5"><div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20"><TrendingUp size={14} className="text-violet-400" /><div><p className="text-[10px] text-[#6b7db3]">Best tone</p><p className="text-[13px] font-semibold text-white">{stats.best_performing_tone}</p></div></div><div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20"><Clock size={14} className="text-cyan-400" /><div><p className="text-[10px] text-[#6b7db3]">Upload time</p><p className="text-[13px] font-semibold text-white">{stats.recommended_upload_time}</p></div></div><div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><div className="flex items-center gap-2 mb-1.5"><Target size={12} className="text-emerald-400" /><p className="text-[10px] text-[#6b7db3]">Weekly focus</p></div><p className="text-[12px] font-medium text-white leading-relaxed">{stats.weekly_focus}</p></div></div></div>
            <div><p className="text-[10px] font-semibold text-[#6b7db3] uppercase tracking-[0.12em] mb-3">Quick Actions</p><div className="space-y-2"><button onClick={() => goToGenerator()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[#a5b4fc] hover:text-white hover:bg-white/[0.05] border border-[rgba(99,102,241,0.12)]"><FileText size={13} className="text-violet-300" /> Write script <ArrowRight size={12} className="ml-auto opacity-40" /></button><button onClick={() => setActiveNav("Prompt Library")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[#a5b4fc] hover:text-white hover:bg-white/[0.05] border border-[rgba(99,102,241,0.12)]"><Lightbulb size={13} className="text-amber-300" /> Browse prompts <ArrowRight size={12} className="ml-auto opacity-40" /></button><button onClick={() => setActiveNav("Content Calendar")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[#a5b4fc] hover:text-white hover:bg-white/[0.05] border border-[rgba(99,102,241,0.12)]"><CalendarDays size={13} className="text-cyan-300" /> Plan upload <ArrowRight size={12} className="ml-auto opacity-40" /></button></div></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
