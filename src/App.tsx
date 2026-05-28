import { useState, useEffect, FormEvent } from "react";
import { 
  Search, Activity, ShieldAlert, FileText, CheckCircle, AlertCircle, 
  Clock, User, Calendar, MapPin, Phone, Mail, Plus, Loader2, 
  ChevronRight, Download, Home, ClipboardList, Award, DollarSign, 
  Filter, Sparkles, TrendingUp, Printer, Lock, Users, AlertTriangle, ArrowRight
} from "lucide-react";

// Types
interface PatientProfile {
  id: string;
  name: {
    given: string[];
    family: string;
    text: string;
  };
  dob: string;
  gender: string;
  race: string;
  ethnicity: string;
  address: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  pcp: string;
  maritalStatus: string;
  language: string;
  lastUpdated: string;
  healthScore: number;
  insurance: {
    payerName: string;
    planName: string;
    planType: string;
    memberId: string;
    groupNumber: string;
    startDate: string;
    endDate: string;
    copay: number;
    deductible: number;
    deductibleMet: number;
    oopMax: number;
    oopMet: number;
    status: 'Active' | 'Inactive' | 'Expired';
    priority: 'Primary' | 'Secondary';
  };
  conditions: Array<{
    name: string;
    icd10: string;
    status: string;
    onset: string;
    severity: 'Severe' | 'Moderate' | 'Mild';
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescriber: string;
    startDate: string;
    status: string;
    interactionRisk?: string;
  }>;
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'Severe' | 'Moderate' | 'Mild';
    recordedDate: string;
  }>;
  observations: Array<{
    name: string;
    value: string;
    unit: string;
    normalRange: string;
    date: string;
    flag: 'Normal' | 'High' | 'Low';
    trend: 'up' | 'down' | 'stable';
  }>;
  encounters: Array<{
    date: string;
    type: 'Inpatient' | 'Outpatient' | 'Emergency';
    reason: string;
    provider: string;
    duration: string;
  }>;
  claims: Array<{
    id: string;
    date: string;
    provider: string;
    code: string;
    billed: number;
    paid: number;
    patientResponsibility: number;
    status: 'Paid' | 'Denied' | 'Pending' | 'In Review';
  }>;
}

interface DenialRiskData {
  denialRiskScore: number;
  riskFactors: Array<{
    name: string;
    category: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    impact: string;
  }>;
  missingData: Array<{
    field: string;
    category: string;
    status: 'missing' | 'complete';
    description: string;
  }>;
  recommendations: Array<{
    id: number;
    text: string;
    priority: 'High' | 'Medium' | 'Low';
    impact: string;
    assignedTo: string;
  }>;
  completionPercentage: number;
}

interface CareGapData {
  applicableMeasures: number;
  met: number;
  gapOverdue: number;
  dueSoon: number;
  qualityScore: number;
  measures: Array<{
    name: string;
    description: string;
    status: 'MET' | 'GAP' | 'DUE SOON' | 'NOT APPLICABLE';
    lastCompleted: string;
    nextDue: string;
    actionNeeded: string;
  }>;
}

interface AIInsightsData {
  summary: string;
  careGapPriority: Array<{
    gap: string;
    urgency: 'High' | 'Medium' | 'Low';
    reason: string;
    suggestedOutreach: string;
  }>;
  riskStratification: {
    overall: 'Low' | 'Medium' | 'High' | 'Critical';
    patientRiskScore: number;
    readmissionScore: number;
    edUtilizationScore: number;
    chronicProgressionScore: number;
    drivers: string[];
  };
  recommendations: {
    clinicalTeam: string[];
    careCoordinator: string[];
    billingTeam: string[];
    patient: string[];
  };
}

export default function App() {
  // Simple Hash-based Router
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash || "#/";
    return hash;
  });

  // Global Toast Notifications
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'err' | 'info' }>>([]);
  const addToast = (message: string, type: 'success' | 'err' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "id" | "insurance">("name");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("recent_searches");
      return stored ? JSON.parse(stored) : [
        { id: "592619", name: { text: "John Edward Smith" }, dob: "1962-03-12", gender: "male" },
        { id: "13681311", name: { text: "Mary Jane Johnson" }, dob: "1968-07-22", gender: "female" }
      ];
    } catch {
      return [];
    }
  });

  // Selected patient details
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [isPatientLoading, setIsPatientLoading] = useState(false);

  // Sub-navigation within Patient Overview Tab
  const [patientSubTab, setPatientSubTab] = useState<"overview" | "clinical" | "gaps" | "insurance" | "denials" | "ai">("overview");
  const [clinicalSubTab, setClinicalSubTab] = useState<"conditions" | "meds" | "allergies" | "labs" | "encounters">("conditions");

  // AI Generated / Verified states
  const [denialRisk, setDenialRisk] = useState<DenialRiskData | null>(null);
  const [isDenialLoading, setIsDenialLoading] = useState(false);

  const [careGaps, setCareGaps] = useState<CareGapData | null>(null);
  const [isGapsLoading, setIsGapsLoading] = useState(false);

  const [aiInsights, setAiInsights] = useState<AIInsightsData | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  // Quick Patient Search bar inside Top Nav
  const [quickSearchText, setQuickSearchText] = useState("");

  // Populate overall recent searches
  const saveRecentSearch = (patient: any) => {
    const updated = [patient, ...recentSearches.filter(p => p.id !== patient.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  // Run Search
  const runSearch = async (termVal: string, typeVal: "name" | "id" | "insurance") => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/patient/search?term=${encodeURIComponent(termVal)}&type=${typeVal}`);
      if (!res.ok) throw new Error("Search query failed");
      const list = await res.json();
      setSearchResults(list);
      if (list.length === 0) {
        addToast("No matching patients found. Showing system directory.", "info");
      } else {
        addToast(`Found ${list.length} results.`, "success");
      }
    } catch (e: any) {
      addToast(e.message || "Unable to query HAPI FHIR server", "err");
    } finally {
      setIsSearching(false);
    }
  };

  // Loaded active patient profile
  const fetchPatientProfile = async (id: string) => {
    setIsPatientLoading(true);
    setPatientData(null);
    setDenialRisk(null);
    setCareGaps(null);
    setAiInsights(null);

    try {
      const res = await fetch(`/api/patient/${id}`);
      if (!res.ok) {
        throw new Error("Target FHIR Patient could not be retrieved from HAPI baseR4.");
      }
      const data: PatientProfile = await res.json();
      setPatientData(data);
      saveRecentSearch(data);
      
      // Concurrently trigger background AI services to prevent blocking UI render
      triggerBackgroundAnalytics(data);

    } catch (e: any) {
      addToast(e.message || "Failed to parse patient medical records", "err");
    } finally {
      setIsPatientLoading(false);
    }
  };

  // Background analytical processors
  const triggerBackgroundAnalytics = async (data: PatientProfile) => {
    // 1. Denial Risk Analyzer
    setIsDenialLoading(true);
    fetch("/api/ai/denial-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientData: data })
    })
      .then(res => res.json())
      .then(d => setDenialRisk(d))
      .catch(() => addToast("Denial Forecasting offline context used.", "info"))
      .finally(() => setIsDenialLoading(false));

    // 2. Dynamic HEDIS clinical gaps
    setIsGapsLoading(true);
    fetch("/api/ai/quality-gaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientData: data })
    })
      .then(res => res.json())
      .then(g => setCareGaps(g))
      .catch(() => addToast("HEDIS measurement fallback activated.", "info"))
      .finally(() => setIsGapsLoading(false));

    // 3. Clinical insights and risk scores
    setIsInsightsLoading(true);
    fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientData: data })
    })
      .then(res => res.json())
      .then(ins => setAiInsights(ins))
      .catch(() => addToast("Clinical LLM model offline. Dynamic rules applied.", "info"))
      .finally(() => setIsInsightsLoading(false));
  };

  // Initial trigger for route checks
  useEffect(() => {
    const parts = route.split("/");
    if (parts[1] === "patient" && parts[2]) {
      const pId = parts[2];
      if (activePatientId !== pId) {
        setActivePatientId(pId);
        fetchPatientProfile(pId);
      }
    } else {
      setActivePatientId(null);
    }
  }, [route]);

  // Handle Quick Patient Search on top panel
  const handleQuickSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quickSearchText.trim()) return;
    navigateTo("#/");
    setSearchTerm(quickSearchText);
    runSearch(quickSearchText, "name");
  };

  // Dynamic values calculation helper
  const calculateOverviewStats = () => {
    if (!patientData) return { totalClaims: 0, billed: 0, paid: 0, rate: 0 };
    const claims = patientData.claims || [];
    const totalClaims = claims.length;
    const billed = claims.reduce((acc, c) => acc + c.billed, 0);
    const paid = claims.reduce((acc, c) => acc + c.paid, 0);
    const denied = claims.filter(c => c.status === "Denied").reduce((acc, c) => acc + c.billed, 0);
    const rate = totalClaims > 0 ? Math.round((claims.filter(c => c.status === "Denied").length / totalClaims) * 100) : 0;
    return { totalClaims, billed, paid, denied, rate };
  };

  const pStats = calculateOverviewStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Dynamic Floating Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all animate-bounce ${
            t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            t.type === 'err' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
            {t.type === 'err' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Clock className="w-5 h-5 text-blue-500 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Modern High-End Top Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo("#/")}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">FHIR Patient Data UI</h1>
            <p className="text-xs text-slate-400 font-medium">HAPI R4 Clinical intelligence</p>
          </div>
        </div>

        {/* Global Links */}
        <div className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => navigateTo("#/")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              route === "#/" || route.startsWith("#/patient") ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
            }`}>
            <Home className="w-4 h-4" /> Patient Registry
          </button>
          <button 
            onClick={() => navigateTo("#/quality-gaps")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              route === "#/quality-gaps" ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
            }`}>
            <ClipboardList className="w-4 h-4" /> Quality Gaps
          </button>
          <button 
            onClick={() => navigateTo("#/denial-risk")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              route === "#/denial-risk" ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
            }`}>
            <ShieldAlert className="w-4 h-4" /> Denial Analyzer
          </button>
        </div>

        {/* Quick Search Action */}
        <form onSubmit={handleQuickSearchSubmit} className="relative w-72 max-w-full">
          <input 
            type="text" 
            placeholder="Search medical directory..." 
            value={quickSearchText}
            onChange={(e) => setQuickSearchText(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-xs px-4 py-2 pl-10 rounded-lg outline-none border border-slate-700 focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        
        {/* =====================================================================
            PAGE 1: PATIENT REGISTRY (HOME / SEARCH)
            ===================================================================== */}
        {(route === "#/" || route === "") && (
          <div className="space-y-6">
            
            {/* HERO HERO SECTION */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-2xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Enterprise Edition</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">FHIR Patient Data UI</h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Consolidated clinical visualizer mapping standard FHIR structures directly from the open HAPI server. Generate predictive denials risk assessments, HEDIS wellness metrics, and care path coordination sheets instantly.
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="bg-slate-800/80 backdrop-blur px-4 py-2.5 rounded-lg border border-slate-750">
                    <span className="block text-xl font-bold text-blue-400">HAPI FHIR</span>
                    <span className="text-xs text-slate-400">R4 public Sandbox</span>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur px-4 py-2.5 rounded-lg border border-slate-750">
                    <span className="block text-xl font-bold text-emerald-400">LLM Engine</span>
                    <span className="text-xs text-slate-400">Gemini 3.5 Flash verified</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 w-44 h-44 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center p-4 animate-pulse">
                <Activity className="w-24 h-24 text-blue-400" />
              </div>
            </div>

            {/* SEARCH PORTAL */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Tabs selector */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setSearchType("name")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      searchType === "name" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}>
                    Search by Name
                  </button>
                  <button 
                    onClick={() => setSearchType("id")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      searchType === "id" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}>
                    Search by Patient ID
                  </button>
                  <button 
                    onClick={() => setSearchType("insurance")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      searchType === "insurance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}>
                    Insurance ID
                  </button>
                </div>
                
                <span className="text-xs font-semibold text-slate-400">Query Target: HAPI sandbox endpoint</span>
              </div>

              {/* Main Search Bar layout */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder={
                      searchType === "name" ? "Type patient name (e.g., 'Smith', 'Johnson', 'Jane')..." :
                      searchType === "id" ? "Type target patient health identifier ID..." :
                      "Type policy member card number..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch(searchTerm, searchType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-sm outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                </div>
                <button 
                  onClick={() => runSearch(searchTerm, searchType)}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 shadow-md transform hover:-translate-y-0.5 active:translate-y-0">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "SEARCH FHIR"}
                </button>
              </div>

              {/* Recent Searches row */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fast Access Defaults:</span>
                {recentSearches.map(pt => (
                  <button 
                    key={pt.id}
                    onClick={() => {
                      navigateTo(`#/patient/${pt.id}`);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pt.name?.text || `Patient #${pt.id}`}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({pt.id})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS VIEW */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Patient Matching Results ({searchResults.length})</h3>
              
              {isSearching ? (
                // LOADING SKELETON CARDS
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-2/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-8 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                // EMPTY STATE
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">No Target Patients Fetched</h4>
                    <p className="text-slate-500 text-xs">
                      Enter a name filter such as <strong className="text-blue-600 hover:underline cursor-pointer" onClick={() => { setSearchTerm("Smith"); runSearch("Smith", "name"); }}>Smith</strong>, <strong className="text-blue-600 hover:underline cursor-pointer" onClick={() => { setSearchTerm("Johnson"); runSearch("Johnson", "name"); }}>Johnson</strong> or query a specific key directly to fetch full diagnostic profiles.
                    </p>
                  </div>
                </div>
              ) : (
                // RESULTS GRID
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((pt: any) => {
                    const initials = pt.name?.text ? pt.name.text.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "PT";
                    return (
                      <div key={pt.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{pt.name?.text || "Unknown Patient"}</h4>
                            <div className="flex flex-wrap text-xs text-slate-500 font-medium gap-x-2 gap-y-1 mt-0.5">
                              <span>DOB: {pt.dob || "Unknown"}</span>
                              <span>•</span>
                              <span className="capitalize">{pt.gender || "Unknown"}</span>
                            </div>
                            <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                              ID: {pt.id}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            navigateTo(`#/patient/${pt.id}`);
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 font-bold text-xs py-2.5 rounded-lg border border-slate-250 hover:border-slate-900 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                          <span>View 360 Profile</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 2: PATIENT 360 PROFILE VIEW WITH SIDEBAR
            ===================================================================== */}
        {route.startsWith("#/patient/") && (
          <div>
            {isPatientLoading ? (
              // BIG PROFILE LOADER SKELETON
              <div className="flex flex-col md:flex-row gap-6 animate-pulse">
                <div className="w-full md:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-6 h-96 space-y-6" />
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 h-[500px]" />
              </div>
            ) : !patientData ? (
              // 404 STATE
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-6">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">FHIR Patient ID Not Found</h3>
                  <p className="text-slate-500 text-xs mt-2">
                    The requested internal FHIR resource could not be aggregated from HAPI server. 
                    Ensure the identifier is accurate, or query one of our high fidelity samples.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => navigateTo("#/")} className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg">
                    Return to Registry
                  </button>
                  <button onClick={() => navigateTo("#/patient/592619")} className="bg-slate-100 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-lg border border-slate-200">
                    Load John Smith Profile
                  </button>
                </div>
              </div>
            ) : (
              // ACTUAL PATIENT MAIN WORKSPACE
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* LEFT COLLAPSIBLE CLINICAL INFORMATION SIDEBAR */}
                <aside className="w-full lg:w-80 shrink-0 space-y-4">
                  <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md space-y-6 relative overflow-hidden">
                    {/* Visual context background node */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none transform translate-x-8 -translate-y-8" />
                    
                    {/* Primary badge info card */}
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md border-x border-t border-blue-400">
                        {patientData.name?.text ? patientData.name.text.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "PT"}
                      </div>
                      <div>
                        <h3 className="font-bold text-base tracking-tight leading-tight">{patientData.name?.text || "Unknown Candidate"}</h3>
                        <div className="text-xs text-slate-400 mt-1 space-y-0.5 font-medium">
                          <p>DOB: {patientData.dob}</p>
                          <p>Gender: <span className="capitalize">{patientData.gender}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Numeric and Identifier details */}
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-medium">Unique Patient ID</span>
                        <span className="font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-[11px] text-blue-300">{patientData.id}</span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-medium">Primary Insurer:</span>
                        <span className="font-bold text-slate-200">{patientData.insurance?.payerName || "Aetna Core"}</span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-medium font-bold">INSURANCE STATUS:</span>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          patientData.insurance?.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          ● {patientData.insurance?.status || "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LEFT NAVIGATION LINKS TAB SELECTOR */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm">
                    <nav className="space-y-1">
                      {[
                        { id: "overview", label: "Patient Overview", icon: User },
                        { id: "clinical", label: "Clinical Snapshot", icon: Activity },
                        { id: "gaps", label: "Quality Gaps (HEDIS)", icon: Award, count: careGaps?.gapOverdue },
                        { id: "insurance", label: "Insurance & Claims", icon: DollarSign },
                        { id: "denials", label: "Denial Risk Analyzer", icon: ShieldAlert, badge: denialRisk?.denialRiskScore ? `${denialRisk.denialRiskScore}%` : null },
                        { id: "ai", label: "Care Team AI Insights", icon: Sparkles }
                      ].map(lnk => {
                        const IconNode = lnk.icon;
                        const isSel = patientSubTab === lnk.id;
                        return (
                          <button 
                            key={lnk.id}
                            onClick={() => setPatientSubTab(lnk.id as any)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                              isSel 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}>
                            <div className="flex items-center gap-2.5">
                              <IconNode className={`w-4 h-4 shrink-0 ${isSel ? "text-blue-400" : "text-slate-400"}`} />
                              <span>{lnk.label}</span>
                            </div>
                            {lnk.count !== undefined && lnk.count > 0 && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] rounded px-1.5 py-0.5 font-extrabold">{lnk.count}</span>
                            )}
                            {lnk.badge && (
                              <span className={`text-[10px] rounded px-1.5 py-0.5 font-extrabold ${
                                parseInt(lnk.badge) > 50 ? "bg-rose-500 text-white" : "bg-emerald-100 text-emerald-800"
                              }`}>{lnk.badge}</span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* PRINT OUT SUMMARY BUTTON */}
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full bg-slate-900 hover:bg-black text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" />
                    <span>Print 360 Intelligence Summary</span>
                  </button>
                </aside>

                {/* RIGHT DETAILED WORKSPACE PANEL */}
                <div className="flex-1 space-y-6">
                  
                  {/* COMPLEMENTARY TOP CARD */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Unified Healthcare Record</span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">{patientData.name?.text}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Continuous verification of clinical resources across primary entities</p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demographic completeness Score</span>
                        <span className="text-lg font-black text-slate-900">{patientData.healthScore}%</span>
                      </div>
                      <div className="w-12 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${patientData.healthScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE TAB DISPLAY CONDITIONAL ROUTING */}
                  
                  {/* SECTION 1 - OVERVIEW TAB */}
                  {patientSubTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Demographics Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Primary Demographics</h4>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-500">Legal Name</span>
                              <span className="font-semibold text-slate-900">{patientData.name?.text}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-500">Date of Birth</span>
                              <span className="font-semibold text-slate-900">{patientData.dob}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-500">Race</span>
                              <span className="font-semibold text-slate-900">{patientData.race}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-500">Ethnicity</span>
                              <span className="font-semibold text-slate-900">{patientData.ethnicity}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-500">Marital Status</span>
                              <span className="font-semibold text-slate-900">{patientData.maritalStatus}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-500">Primary Language</span>
                              <span className="font-semibold text-slate-900">{patientData.language}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contacts & Address */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Direct Contacts & Address</h4>
                          <div className="space-y-3.5 text-xs">
                            <div className="flex items-center gap-3 py-1 border-b border-slate-50">
                              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="block text-[10px] text-slate-400">Mobile Phone</span>
                                <span className="font-semibold text-slate-900">{patientData.phone}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-1 border-b border-slate-50">
                              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="block text-[10px] text-slate-400">Email Address</span>
                                <span className="font-semibold text-slate-900">{patientData.email}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 py-1">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="block text-[10px] text-slate-400">Home Address</span>
                                <span className="font-semibold text-slate-900">
                                  {patientData.address?.line?.join(", ")}<br />
                                  {patientData.address?.city}, {patientData.address?.state} {patientData.address?.postalCode}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Care Provider Information */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Care Provider (PCP)</span>
                            <span className="font-bold text-slate-900">{patientData.pcp}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">FHIR Resource Last Synced</span>
                          <span className="font-mono text-xs font-semibold text-slate-650">{patientData.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2 - CLINICAL DATA SUB TABS */}
                  {patientSubTab === "clinical" && (
                    <div className="space-y-6">
                      
                      {/* Sub tab navigation */}
                      <div className="flex flex-wrap border-b border-slate-200">
                        {[
                          { id: "conditions", label: "Active Conditions", count: patientData.conditions?.length },
                          { id: "meds", label: "Medication Directives", count: patientData.medications?.length },
                          { id: "allergies", label: "Sensitivities / Allergies", count: patientData.allergies?.length },
                          { id: "labs", label: "Lab Diagnostic Observations", count: patientData.observations?.length },
                          { id: "encounters", label: "Recent Encounters", count: patientData.encounters?.length }
                        ].map(sub => (
                          <button 
                            key={sub.id}
                            onClick={() => setClinicalSubTab(sub.id as any)}
                            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                              clinicalSubTab === sub.id 
                                ? "border-slate-900 text-slate-900" 
                                : "border-transparent text-slate-400 hover:text-slate-900"
                            }`}>
                            {sub.label} {sub.count !== undefined && <span className="bg-slate-100 text-slate-600 ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold">{sub.count}</span>}
                          </button>
                        ))}
                      </div>

                      {/* sub-sub-view rendering */}
                      {clinicalSubTab === "conditions" && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                                  <th className="p-4">Diagnosis Name</th>
                                  <th className="p-4">ICD-10 Code</th>
                                  <th className="p-4">Record Status</th>
                                  <th className="p-4">Onset Date</th>
                                  <th className="p-4">Severity Tier</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {patientData.conditions?.map((c, i) => (
                                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                                    <td className="p-4 font-mono font-bold text-blue-600">{c.icd10}</td>
                                    <td className="p-4"><span className="bg-emerald-50 text-emerald-850 px-2 py-0.5 rounded font-semibold text-[10px] uppercase border border-emerald-150">{c.status}</span></td>
                                    <td className="p-4 font-medium text-slate-600">{c.onset}</td>
                                    <td className="p-4">
                                      <span className={`px-2 py-1.5 rounded-lg font-bold text-[10px] uppercase ${
                                        c.severity === "Severe" ? "bg-rose-50 text-rose-800 border border-rose-100" :
                                        c.severity === "Moderate" ? "bg-amber-50 text-amber-800 border border-amber-100" :
                                        "bg-slate-100 text-slate-700"
                                      }`}>
                                        {c.severity}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {clinicalSubTab === "meds" && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                                  <th className="p-4">Drug Item Designation</th>
                                  <th className="p-4">Dosage Limit</th>
                                  <th className="p-4">Frequency Period</th>
                                  <th className="p-4">Clinician Prescriber</th>
                                  <th className="p-4">Start Effective</th>
                                  <th className="p-4">Claims Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {patientData.medications?.map((m, i) => (
                                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                      <div className="font-bold text-slate-900">{m.name}</div>
                                      {m.interactionRisk && (
                                        <div className="mt-1 flex items-start gap-1 p-2 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-800">
                                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                          <span className="font-medium">Interaction Hold: {m.interactionRisk}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-4 font-medium text-slate-600">{m.dosage || "As Directed"}</td>
                                    <td className="p-4 font-medium text-slate-600">{m.frequency}</td>
                                    <td className="p-4 text-slate-700 font-semibold">{m.prescriber}</td>
                                    <td className="p-4 text-slate-500 font-medium">{m.startDate}</td>
                                    <td className="p-4"><span className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase">{m.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {clinicalSubTab === "allergies" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {patientData.allergies?.map((all, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-slate-900 text-sm leading-snug">{all.allergen}</h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  all.severity === 'Severe' ? 'bg-rose-50 text-rose-800 border border-rose-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                                }`}>
                                  {all.severity}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-800">Reaction Event:</strong> {all.reaction}</p>
                              <div className="text-[10px] text-slate-400 font-medium">Recorded Date: {all.recordedDate}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {clinicalSubTab === "labs" && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                                  <th className="p-4">Assay / Diagnostic Indicator Name</th>
                                  <th className="p-4">Value Found</th>
                                  <th className="p-4">Normal Reference Range</th>
                                  <th className="p-4">Diagnostic Flag</th>
                                  <th className="p-4">Date Documented</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {patientData.observations?.map((obs, i) => {
                                  const isAbnormal = obs.flag === "High" || obs.flag === "Low";
                                  return (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="p-4 font-bold text-slate-900">{obs.name}</td>
                                      <td className="p-4">
                                        <span className={`font-mono text-sm font-black ${isAbnormal ? "text-rose-600" : "text-emerald-700"}`}>
                                          {obs.value} <span className="text-xs font-normal text-slate-500">{obs.unit}</span>
                                        </span>
                                      </td>
                                      <td className="p-4 font-semibold text-slate-500">{obs.normalRange || "Reference range pending"}</td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                          obs.flag === "High" ? "bg-rose-50 text-rose-800 border border-rose-100" :
                                          obs.flag === "Low" ? "bg-amber-50 text-amber-800 border border-amber-100" :
                                          "bg-slate-100 text-slate-600"
                                        }`}>
                                          {obs.flag === "High" ? "▲ HIGH" : obs.flag === "Low" ? "▼ LOW" : "● NORMAL"}
                                        </span>
                                      </td>
                                      <td className="p-4 text-slate-500 font-medium">{obs.date}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {clinicalSubTab === "encounters" && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                          <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6">
                            {patientData.encounters?.map((enc, i) => (
                              <div key={i} className="relative">
                                {/* Timeline nodes */}
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                                  enc.type === "Emergency" ? "bg-rose-500" : enc.type === "Inpatient" ? "bg-blue-500" : "bg-emerald-500"
                                }`} />
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-bold text-xs text-slate-900 leading-tight">{enc.reason}</span>
                                    <span className="font-mono text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">{enc.date}</span>
                                  </div>
                                  <div className="flex flex-wrap text-slate-500 font-medium gap-3">
                                    <span>Type: <strong className="text-slate-700 capitalize">{enc.type}</strong></span>
                                    <span>•</span>
                                    <span>Clinician: <strong className="text-slate-700">{enc.provider}</strong></span>
                                    <span>•</span>
                                    <span>Duration: <strong className="text-slate-700">{enc.duration}</strong></span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTION 3 - QUALITY GAPS TAB */}
                  {patientSubTab === "gaps" && (
                    <div className="space-y-6">
                      
                      {/* Metric Summary row */}
                      {isGapsLoading ? (
                        <div className="h-24 bg-white border border-slate-205 rounded-xl animate-pulse" />
                      ) : careGaps ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Applicable Measures</span>
                            <span className="text-2xl font-black text-slate-900">{careGaps.applicableMeasures}</span>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Met Criteria</span>
                            <span className="text-2xl font-black text-emerald-600">{careGaps.met}</span>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-rose-800">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overdue Gaps</span>
                            <span className="text-2xl font-black text-rose-600">{careGaps.gapOverdue}</span>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due Soon / Warning</span>
                            <span className="text-2xl font-black text-amber-600">{careGaps.dueSoon}</span>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center bg-slate-900 text-white col-span-2 md:col-span-1">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">HEDIS Quality Rank</span>
                            <span className="text-2xl font-black text-blue-400">{careGaps.qualityScore}%</span>
                          </div>
                        </div>
                      ) : null}

                      {/* Detailed list cards */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculated Quality Measures (HEDIS criteria)</h4>
                        {isGapsLoading ? (
                          <div className="space-y-3">
                            <div className="h-16 bg-slate-200 rounded-xl" />
                            <div className="h-16 bg-slate-200 rounded-xl" />
                          </div>
                        ) : careGaps?.measures?.map((m, i) => (
                          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors">
                            <div className="space-y-1 max-w-2xl text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-bold text-sm text-slate-900">{m.name}</h5>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  m.status === 'MET' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                                  m.status === 'GAP' ? 'bg-rose-50 text-rose-850 border border-rose-150' :
                                  'bg-amber-50 text-amber-800 border border-amber-150'
                                }`}>
                                  {m.status}
                                </span>
                              </div>
                              <p className="text-slate-550 font-medium leading-relaxed">{m.description}</p>
                              {m.actionNeeded && (
                                <div className="mt-2 text-slate-700 bg-slate-50 border border-slate-150 px-3 py-2 rounded-lg font-medium flex items-start gap-1 pb-2">
                                  <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                  <span><strong className="text-slate-900 font-bold">Action Needed:</strong> {m.actionNeeded}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="shrink-0 text-right text-xs font-medium text-slate-500 space-y-0.5">
                              <p>Last Evaluated: <span className="text-slate-850 font-bold">{m.lastCompleted}</span></p>
                              <p>Next Due Limit: <span className="text-slate-850 font-bold">{m.nextDue}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION 4 - INSURANCE & CLAIMS TAB */}
                  {patientSubTab === "insurance" && (
                    <div className="space-y-6">
                      
                      {/* Coverage details card */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Primary Insurance Benefits Verification</h4>
                          <span className="inline-flex bg-slate-900 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Verified Account</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Payer Network</span>
                            <span className="font-bold text-slate-800 text-sm leading-tight block">{patientData.insurance?.payerName}</span>
                            <span className="text-slate-400 text-[11px] block mt-1">{patientData.insurance?.planName}</span>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Subscriber IDs</span>
                            <p>Member ID: <strong className="text-slate-900 font-mono">{patientData.insurance?.memberId}</strong></p>
                            <p>Group Number: <strong className="text-slate-900 font-mono">{patientData.insurance?.groupNumber}</strong></p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Coverage Term Limits</span>
                            <p>Start Date: <strong className="text-slate-900">{patientData.insurance?.startDate}</strong></p>
                            <p>End Limit: <strong className="text-slate-900">{patientData.insurance?.endDate}</strong></p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">In-Network Office Copay</span>
                            <span className="text-slate-900 font-extrabold text-lg">${patientData.insurance?.copay} <span className="text-xs font-normal text-slate-400">per consult</span></span>
                          </div>
                        </div>

                        {/* Financial Met levels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center font-bold">
                              <span>Annual Deductible Cap</span>
                              <span>${patientData.insurance?.deductibleMet} / ${patientData.insurance?.deductible}</span>
                            </div>
                            <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded" style={{ width: `${Math.min(100, ((patientData.insurance?.deductibleMet || 0) / (patientData.insurance?.deductible || 1)) * 100)}%` }} />
                            </div>
                          </div>

                          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center font-bold">
                              <span>Max Out-of-Pocket Cap</span>
                              <span>${patientData.insurance?.oopMet} / ${patientData.insurance?.oopMax}</span>
                            </div>
                            <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded" style={{ width: `${Math.min(100, ((patientData.insurance?.oopMet || 0) / (patientData.insurance?.oopMax || 1)) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Claims Summary metric block */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aggregate Claims</span>
                          <span className="text-xl font-bold font-black text-slate-900">{pStats.totalClaims}</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Value Billed</span>
                          <span className="text-xl font-bold font-black text-slate-900">${pStats.billed}</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Reimbursed</span>
                          <span className="text-xl font-bold font-black text-emerald-600">${pStats.paid}</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center bg-rose-50 text-rose-950 border-rose-100">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Insurance Denial Rate</span>
                          <span className="text-xl font-bold font-black text-rose-600">{pStats.rate}%</span>
                        </div>
                      </div>

                      {/* Claims table list */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                                <th className="p-4">Claim ID</th>
                                <th className="p-4">Date of Service</th>
                                <th className="p-4">Clincial Provider</th>
                                <th className="p-4">CPT / Billing Codes</th>
                                <th className="p-4 text-right">Billed</th>
                                <th className="p-4 text-right">Insurance Paid</th>
                                <th className="p-4 text-right font-bold">Patient Responsibility</th>
                                <th className="p-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {patientData.claims?.map((cl, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 font-mono font-bold text-slate-900">{cl.id}</td>
                                  <td className="p-4 text-slate-500 font-medium">{cl.date}</td>
                                  <td className="p-4 font-semibold text-slate-700">{cl.provider}</td>
                                  <td className="p-4 font-semibold text-slate-500">{cl.code}</td>
                                  <td className="p-4 text-right font-semibold text-slate-700">${cl.billed}</td>
                                  <td className="p-4 text-right text-emerald-700 font-bold">${cl.paid}</td>
                                  <td className="p-4 text-right text-slate-900 font-bold">${cl.patientResponsibility}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                      cl.status === "Paid" ? "bg-emerald-50 text-emerald-800 border border-emerald-150" :
                                      cl.status === "Denied" ? "bg-rose-50 text-rose-800 border border-rose-150" :
                                      "bg-amber-50 text-amber-800 border border-amber-150"
                                    }`}>
                                      {cl.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5 - DENIAL RISK ANALYZER */}
                  {patientSubTab === "denials" && (
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Circular Meter Gauge widget */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">AI Claim Denial Risk</h4>
                          
                          {isDenialLoading ? (
                            <div className="w-32 h-32 rounded-full border-4 border-slate-105 border-t-blue-500 animate-spin" />
                          ) : denialRisk ? (
                            <div className="space-y-2">
                              {/* Custom SVG Meter */}
                              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="72" cy="72" r="60" stroke="#E2E8F0" strokeWidth="12" fill="transparent" />
                                  <circle cx="72" cy="72" r="60" stroke={
                                    denialRisk.denialRiskScore > 60 ? "#EF4444" :
                                    denialRisk.denialRiskScore > 30 ? "#F59E0B" :
                                    "#10B981"
                                  } strokeWidth="12" fill="transparent" 
                                    strokeDasharray="377" 
                                    strokeDashoffset={377 - (377 * denialRisk.denialRiskScore) / 100}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute text-3xl font-black text-slate-900">{denialRisk.denialRiskScore}%</span>
                              </div>
                              <div className={`font-bold text-xs uppercase tracking-wider ${
                                denialRisk.denialRiskScore > 60 ? "text-rose-600" :
                                denialRisk.denialRiskScore > 30 ? "text-amber-600" :
                                "text-emerald-600"
                              }`}>
                                {denialRisk.denialRiskScore > 60 ? "HIGH SYSTEMIC RISK" :
                                 denialRisk.denialRiskScore > 30 ? "MODERATE AUDIT RISK" :
                                 "PROCEED WITH CONFIDENCE (LOW)"}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Missing Fields list */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm col-span-2 space-y-4">
                          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Missing Documentation Checks</h4>
                          {isDenialLoading ? (
                            <div className="space-y-3">
                              <div className="h-10 bg-slate-200 rounded" />
                              <div className="h-10 bg-slate-200 rounded animate-pulse" />
                            </div>
                          ) : denialRisk?.missingData?.map((m, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs">
                              {m.status === 'missing' ? (
                                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-emerald-550 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className={`font-bold block ${m.status === 'missing' ? 'text-rose-800' : 'text-slate-800'}`}>
                                  {m.field} <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded ml-1 font-medium">{m.category}</span>
                                </span>
                                <span className="text-slate-500 font-medium">{m.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Diagnostic risk list table */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Identified Risk Factors for Denial Rejection</h4>
                        <div className="overflow-x-auto text-xs font-semibold">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3">Forecast Risk Name</th>
                                <th className="pb-3">Factor Category</th>
                                <th className="pb-3 text-center">Severity</th>
                                <th className="pb-3">Clinical Description</th>
                                <th className="pb-3">Payer Reimbursement Impact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {denialRisk?.riskFactors?.map((f, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3.5 font-bold text-slate-900">{f.name}</td>
                                  <td className="py-3.5"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold text-[10px]">{f.category}</span></td>
                                  <td className="py-3.5 text-center">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                      f.severity === 'High' ? 'bg-rose-50 text-rose-850 border border-rose-100' : 'bg-slate-100 text-slate-650'
                                    }`}>{f.severity}</span>
                                  </td>
                                  <td className="py-3.5 text-slate-600 font-medium leading-relaxed">{f.description}</td>
                                  <td className="py-3.5 text-rose-700 font-medium leading-snug">{f.impact}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Revenue cycle actionable recommendations */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">RCM Recovery & Denial Appeal Action Plan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {denialRisk?.recommendations?.map((rec) => (
                            <div key={rec.id} className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs leading-relaxed">
                              <div className="flex justify-between items-center">
                                <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded">Action #{rec.id}</span>
                                <span className="bg-blue-50 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded border border-blue-150 uppercase">{rec.assignedTo}</span>
                              </div>
                              <p className="font-bold text-slate-900 text-sm">{rec.text}</p>
                              <p className="font-medium text-slate-600 font-serif border-t border-slate-50 pt-2"><strong className="text-slate-800">Appeal Value:</strong> {rec.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 6 - AI COORINDATION CLINICAL INSIGHTS */}
                  {patientSubTab === "ai" && (
                    <div className="space-y-6">
                      
                      {/* LLM Brief summary card */}
                      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          <h4 className="font-bold text-sm tracking-tight">Clinical Artificial Intelligence Summary</h4>
                        </div>
                        {isInsightsLoading ? (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-white/20 rounded w-full" />
                            <div className="h-4 bg-white/20 rounded w-5/6" />
                          </div>
                        ) : (
                          <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-serif">
                            {aiInsights?.summary || "Generative Clinical intelligence summary pending checkout."}
                          </p>
                        )}
                      </div>

                      {/* Risk Scores Grid */}
                      {aiInsights?.riskStratification && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Multiconditional Clinical Risk Stratification</h4>
                            <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Rank: {aiInsights.riskStratification.overall}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
                              <div>
                                <span className="block text-slate-400 text-[10px] uppercase font-extrabold tracking-wider">Patient Risk Score</span>
                                <span className="text-slate-400 text-[10px] font-medium leading-none mt-0.5 block">Overall clinical health risk</span>
                              </div>
                              <div className="flex justify-between items-baseline pt-2">
                                <span className="text-2xl font-black text-blue-400">{aiInsights.riskStratification.patientRiskScore}%</span>
                                <span className={`text-[10px] font-extrabold uppercase ${
                                  aiInsights.riskStratification.patientRiskScore > 70 ? "text-rose-400" :
                                  aiInsights.riskStratification.patientRiskScore > 40 ? "text-amber-400" :
                                  "text-emerald-400"
                                }`}>
                                  {aiInsights.riskStratification.patientRiskScore > 70 ? "High Risk" :
                                   aiInsights.riskStratification.patientRiskScore > 40 ? "Moderate" :
                                   "Low Risk"}
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-550 bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                              <span className="block text-slate-500">Readmission Forecast</span>
                              <div className="flex justify-between items-center text-sm font-black text-slate-800">
                                <span>Risk Level</span>
                                <span>{aiInsights.riskStratification.readmissionScore}%</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                              <span className="block text-slate-500">ED Over-utilization</span>
                              <div className="flex justify-between items-center text-sm font-black text-slate-800">
                                <span>Risk Level</span>
                                <span>{aiInsights.riskStratification.edUtilizationScore}%</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                              <span className="block text-slate-500">Chronic Progression Speed</span>
                              <div className="flex justify-between items-center text-sm font-black text-slate-800">
                                <span>Acceleration Score</span>
                                <span>{aiInsights.riskStratification.chronicProgressionScore}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Drivers listing */}
                          <div className="text-xs space-y-2 border-t border-slate-100 pt-4">
                            <span className="block text-slate-400 font-bold uppercase tracking-wider">Active Clinical Risk Drivers:</span>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
                              {aiInsights.riskStratification.drivers?.map((dr, index) => (
                                <li key={index}>{dr}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Care Gap priority outreach */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Urgent Preventative Outreach Outreach Task List</h4>
                        <div className="space-y-3 text-xs leading-relaxed">
                          {aiInsights?.careGapPriority?.map((item, index) => (
                            <div key={index} className="flex justify-between items-start gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50 hover:bg-white transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm leading-tight">{item.gap}</span>
                                  <span className="bg-rose-100 text-rose-800 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">{item.urgency}</span>
                                </div>
                                <p className="text-slate-500 font-semibold">{item.reason}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preferred Outreach</span>
                                <span className="font-bold text-slate-800">{item.suggestedOutreach}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clinical Recommendations Panel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                          <span className="font-bold text-blue-600 block uppercase tracking-wider text-[11px]">Clinical Interventions</span>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 font-medium">
                            {aiInsights?.recommendations?.clinicalTeam?.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                          <span className="font-bold text-emerald-700 block uppercase tracking-wider text-[11px]">Care Team Coordination</span>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 font-medium">
                            {aiInsights?.recommendations?.careCoordinator?.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                          <span className="font-bold text-slate-805 block uppercase tracking-wider text-[11px]">Financial/Billing Interventions</span>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 font-medium">
                            {aiInsights?.recommendations?.billingTeam?.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                          <span className="font-bold text-amber-700 block uppercase tracking-wider text-[11px]">Structured Patient Homework</span>
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 font-medium">
                            {aiInsights?.recommendations?.patient?.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            PAGE 3: QUALITY GAPS POPULATION VIEW
            ===================================================================== */}
        {route === "#/quality-gaps" && (
          <div className="space-y-6">
            
            {/* Top stats header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">Care Gaps Population Registry</h2>
                <p className="text-xs text-slate-500 mt-1">Cross-sectional cohort screening with action links for outreaches</p>
              </div>

              <div className="flex gap-4 text-xs font-semibold shrink-0">
                <div className="bg-blue-50 border border-blue-150 p-2.5 rounded-lg text-center">
                  <span className="text-slate-400 block mb-0.5">Total Gaps Active</span>
                  <span className="text-lg font-black text-blue-800">5 measures</span>
                </div>
                <div className="bg-rose-50 border border-rose-150 p-2.5 rounded-lg text-center">
                  <span className="text-slate-400 block mb-0.5">Critical Cohort patients</span>
                  <span className="text-lg font-black text-rose-800">2 cases</span>
                </div>
              </div>
            </div>

            {/* Patients table layout holding open quality gaps */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-sm">Active Cohort Roster</span>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">2 Patients Listed</span>
                </div>
                <button 
                  onClick={() => addToast("Successfully exported 2 patients to Star measures standard CSV report format.", "success")}
                  className="bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-lg border border-slate-700 shadow-sm transition-all text-[11px] flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Export standard HEDIS CSV
                </button>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="p-4">Identified Patient</th>
                    <th className="p-4">Identifier ID</th>
                    <th className="p-4">Active Open Gaps</th>
                    <th className="p-4">Most Urgent Evaluation Need</th>
                    <th className="p-4">Calculated Compliance score</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[11px]">JS</div>
                      <div>
                        <span className="font-bold text-slate-900 block font-sans">John Edward Smith</span>
                        <span className="text-slate-450 block text-[10px] font-medium font-mono">64-year-old Diabetes Cohort</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">592619</td>
                    <td className="p-4"><span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">3 Open Gaps</span></td>
                    <td className="p-4 text-slate-650 leading-tight">Diabetic Retinal Eye Examination (Overdue 12+ months)</td>
                    <td className="p-4 text-emerald-700 font-bold text-sm">82% (HEDIS Rank)</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigateTo("#/patient/592619");
                            setPatientSubTab("gaps");
                          }}
                          className="bg-slate-900 hover:bg-black text-white font-bold text-[11px] py-1.5 px-3 rounded-lg">
                          Coordinate Case
                        </button>
                        <button 
                          onClick={() => addToast("Outreach task launched securely for John's primary mobile portal profile.", "success")}
                          className="bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px] py-1.5 px-3 rounded-lg shadow-sm">
                          Engage Outreach
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[11px]">MJ</div>
                      <div>
                        <span className="font-bold text-slate-900 block font-sans">Mary Jane Johnson</span>
                        <span className="text-slate-450 block text-[10px] font-medium font-mono">58-year-old Preventive Screening Cohort</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">13681311</td>
                    <td className="p-4"><span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">2 Open Gaps</span></td>
                    <td className="p-4 text-slate-650 leading-tight">Screening Mammography Diagnostic Review (Overdue 24+ months)</td>
                    <td className="p-4 text-emerald-750 font-bold text-sm">73% (Preventive compliance)</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigateTo("#/patient/13681311");
                            setPatientSubTab("gaps");
                          }}
                          className="bg-slate-900 hover:bg-black text-white font-bold text-[11px] py-1.5 px-3 rounded-lg">
                          Coordinate Case
                        </button>
                        <button 
                          onClick={() => addToast("FIT test kit scheduled to dispatch securely to Mary's home address.", "success")}
                          className="bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px] py-1.5 px-3 rounded-lg shadow-sm">
                          Engage Outreach
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 4: DENIAL RISK GLOBAL REPORT
            ===================================================================== */}
        {route === "#/denial-risk" && (
          <div className="space-y-6">
            
            {/* Executive Dashboard banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Denial Risk Score</span>
                <span className="text-3xl font-black text-slate-900 block">48%</span>
                <span className="text-xs text-slate-400 block font-medium">Weighted mean across indexed patient structures</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-1 text-rose-800">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active claims value at risk</span>
                <span className="text-3xl font-black text-rose-600 block">$1,895.00</span>
                <span className="text-xs text-rose-400 block font-medium">Valued pending final Retro appeal submissions</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-1 text-emerald-800">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average processing speed</span>
                <span className="text-3xl font-black text-emerald-600 block">14.2 days</span>
                <span className="text-xs text-emerald-400 block font-medium">HAPI R4 automated processing interval</span>
              </div>
            </div>

            {/* List cohort table of high risk patients */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs font-semibold">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h4 className="font-bold text-slate-800 text-sm">Indexed Cohort denial risks for medical entities</h4>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="p-4">Identified medical candidate</th>
                    <th className="p-4">Subscriber Member ID</th>
                    <th className="p-4 font-bold text-center">Calculated Denial Risk Score</th>
                    <th className="p-4">Primary diagnostic driver</th>
                    <th className="p-4">Claim responsibility value</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-705">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[11px]">JS</div>
                      <div>
                        <span className="font-bold text-slate-900 block font-sans">John Edward Smith</span>
                        <span className="text-slate-450 block text-[10px] font-medium font-mono">Blue Cross Blue Shield Primary</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">BCBS99212874</td>
                    <td className="p-4 text-center">
                      <span className="bg-rose-50 text-rose-800 font-bold text-[11px] border border-rose-150 px-2.5 py-1 rounded-full inline-block">58% Severe Risk</span>
                    </td>
                    <td className="p-4 text-slate-655 leading-snug">Emergency room diagnostic code (99284) denied retro-authorization</td>
                    <td className="p-4 text-slate-900 font-black">$1,850.00 (Pending)</td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          navigateTo("#/patient/592619");
                          setPatientSubTab("denials");
                        }}
                        className="bg-slate-900 hover:bg-black text-white font-bold text-[11px] py-1.5 px-3.5 rounded-lg shadow-sm">
                        Forecaster details
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[11px]">MJ</div>
                      <div>
                        <span className="font-bold text-slate-900 block font-sans">Mary Jane Johnson</span>
                        <span className="text-slate-450 block text-[10px] font-medium font-mono">Aetna choice POS II Primary</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">AET-5542190</td>
                    <td className="p-4 text-center">
                      <span className="bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-150 px-2.5 py-1 rounded-full inline-block">38% Moderate Risk</span>
                    </td>
                    <td className="p-4 text-slate-655 leading-snug">Active step therapy verification constraint for Omeprazole formulary</td>
                    <td className="p-4 text-slate-900 font-black">$45.00 (In review)</td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          navigateTo("#/patient/13681311");
                          setPatientSubTab("denials");
                        }}
                        className="bg-slate-900 hover:bg-black text-white font-bold text-[11px] py-1.5 px-3.5 rounded-lg shadow-sm">
                        Forecaster details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER METADATA BAR DESCRIPTION */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-6 text-center text-xs text-slate-400 font-semibold space-y-1">
        <p>© 2026 FHIR Patient Data UI Platform.</p>
        <p className="text-slate-405">Aggregates standard Patient, Observation, AllergyIntolerance, Encounter, and Coverage resources from baseR4 endpoints.</p>
      </footer>
    </div>
  );
}
