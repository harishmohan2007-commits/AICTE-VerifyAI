import { useEffect, useMemo, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileSearch,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  HelpCircle,
  History,
  Image,
  Info,
  LayoutDashboard,
  ListChecks,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  UserCheck,
  Users,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

type Page = "overview" | "applications" | "documents" | "compliance" | "infrastructure" | "review" | "reports" | "audit" | "rules" | "settings"
type AppStatus = "Submitted" | "Processing" | "Deficiencies Found" | "Pending Verification" | "Ready for Review" | "Completed"
type DocStatus = "Verified" | "Mismatch Detected" | "Expired" | "Pending Verification" | "Source Unavailable" | "Manual Review Required"

type Application = {
  id: string
  institution: string
  category: string
  submitted: string
  docs: number
  progress: number
  status: AppStatus
  officer: string
  programme: string
  district: string
  intake: number
}
type DocumentRecord = {
  id: string
  name: string
  type: string
  appId: string
  institution: string
  uploaded: string
  expiry: string
  status: DocStatus
  ref: string
  authority: string
  confidence: number
}
type Rule = {
  id: string
  name: string
  category: string
  evidence: string
  enabled: boolean
  severity: "High" | "Medium" | "Low"
  updated: string
  source: string
}
type ReviewCase = {
  id: string
  appId: string
  institution: string
  finding: string
  priority: "High" | "Medium" | "Low"
  officer: string
  date: string
  status: string
  evidence: number
  notes: string
}
type AuditEvent = {
  id: number
  time: string
  user: string
  role: string
  action: string
  target: string
  detail: string
  result: string
}

const categories = [
  "Extension of Approval (EoA)",
  "New Programme",
  "Increase in Intake",
  "Programme Change",
  "Institution Details Update",
  "Other Approval-Related Changes",
]
const officers = [
  "Anita Rao",
  "Vikram Menon",
  "Priya Shah",
  "S. Krishnan",
  "Meera Nair",
]
const institutions = [
  "Northfield Institute of Technology",
  "Aarohan College of Engineering",
  "Riverbend Polytechnic",
  "Saraswati Institute of Applied Sciences",
  "Meridian School of Technology",
  "Greencrest Technical Campus",
  "Pioneer College of Engineering",
  "Horizon Institute of Technology",
]
const appStatuses: AppStatus[] = [
  "Submitted",
  "Processing",
  "Deficiencies Found",
  "Pending Verification",
  "Ready for Review",
  "Completed",
]
const docNames = [
  "Institutional Affidavit",
  "Accreditation Certificate",
  "Building Stability Certificate",
  "Fire Safety Certificate",
  "Occupancy Certificate",
  "Faculty Details",
  "Approved Programme Details",
  "No Objection Certificate",
]

const seedApplications: Application[] = Array.from({ length: 12 }, (_, i) => ({
  id: `AICTE-2025-${String(1048 - i).padStart(4, "0")}`,
  institution: institutions[i % institutions.length],
  category: categories[i % categories.length],
  submitted: `2025-${
    i < 8 ? "04" : "03"
  }-${String(26 - (i % 9) * 2).padStart(2, "0")}`,
  docs: 8 + (i % 6),
  progress: [82, 54, 67, 91, 38, 100, 73, 46, 88, 62, 95, 28][i],
  status: appStatuses[[4, 3, 2, 1, 0, 5, 2, 3, 4, 1, 5, 0][i]],
  officer: officers[i % officers.length],
  programme: [
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "AI & Data Science",
  ][i % 4],
  district: ["Pune", "Jaipur", "Kochi", "Bengaluru"][i % 4],
  intake: [120, 60, 90, 180][i % 4],
}))

const docStatusList: DocStatus[] = [
  "Verified",
  "Pending Verification",
  "Mismatch Detected",
  "Expired",
  "Manual Review Required",
  "Source Unavailable",
]
const seedDocuments: DocumentRecord[] = Array.from({ length: 30 }, (_, i) => {
  const app = seedApplications[i % seedApplications.length]
  return {
    id: `DOC-${3100 + i}`,
    name: docNames[i % docNames.length],
    type: docNames[i % docNames.length],
    appId: app.id,
    institution: app.institution,
    uploaded: `2025-04-${String(2 + (i % 22)).padStart(2, "0")}`,
    expiry: i % 5 === 0 ? "2025-03-31" : `202${6 + (i % 3)}-03-31`,
    status: docStatusList[i % docStatusList.length],
    ref: `REF/${String(45120 + i)}/2025`,
    authority: [
      "State Accreditation Board",
      "Municipal Safety Office",
      "Registrar of Societies",
    ][i % 3],
    confidence: [96, 88, 73, 92, 68][i % 5],
  }
})

const seedRules: Rule[] = [
  "Required institutional affidavit present",
  "Accreditation validity checked",
  "Fire safety certificate present and valid where applicable",
  "Building stability documentation present where applicable",
  "Approved programmes match submitted programme details",
  "Institution identifiers are consistent across documents",
  "Previous approval status reviewed",
  "Faculty records are complete where applicable",
  "Required payment status confirmed where applicable",
  "Occupancy evidence supplied",
  "Application form completeness",
  "Authorized signatory details consistent",
  "Programme intake within submitted approval",
  "Document expiry dates checked",
  "Prior deficiencies rectified",
].map((name, i) => ({
  id: `RULE-${String(i + 1).padStart(3, "0")}`,
  name,
  category: i % 3 === 0 ? "All categories" : categories[i % categories.length],
  evidence: i % 2 ? "Application record" : docNames[i % docNames.length],
  enabled: i !== 11,
  severity: (["High", "Medium", "Low"] as const)[i % 3],
  updated: `2025-04-${String(20 - (i % 8)).padStart(2, "0")}`,
  source: `Configurable handbook reference ${4 + i}.${1 + (i % 5)}`,
}))

const seedCases: ReviewCase[] = Array.from({ length: 12 }, (_, i) => ({
  id: `CASE-${220 + i}`,
  appId: seedApplications[i].id,
  institution: seedApplications[i].institution,
  finding: [
    "Institution identifier differs across two records",
    "Certificate reference requires authority confirmation",
    "Document expiry precedes application date",
    "Faculty record is incomplete",
  ][i % 4],
  priority: (["High", "Medium", "Low"] as const)[i % 3],
  officer: officers[i % officers.length],
  date: `2025-04-${String(25 - i).padStart(2, "0")}`,
  status: ["Open", "Awaiting Rectification", "In Review", "Ready for Review"][
    i % 4
  ],
  evidence: 2 + (i % 4),
  notes: "",
}))

const seedAudit: AuditEvent[] = Array.from({ length: 20 }, (_, i) => ({
  id: 1000 + i,
  time: `2025-04-${String(26 - Math.floor(i / 3)).padStart(2, "0")} ${String(9 + (i % 8)).padStart(2, "0")}:${
    i % 2 ? "15" : "42"
  }`,
  user: officers[i % officers.length],
  role: i % 4 === 0 ? "Administrator" : "Regulatory Officer",
  action: [
    "Application created",
    "Document uploaded",
    "Validation executed",
    "Compliance rule evaluated",
    "Verification result recorded",
    "Review assigned",
    "Rectification requested",
    "Finding resolved",
    "Rule updated",
  ][i % 9],
  target: i % 3 ? seedApplications[i % 12].id : seedDocuments[i % 30].id,
  detail:
    "Action recorded.",
  result: i % 5 === 0 ? "Review required" : "Completed",
}))

const nav: { id: Page label: string icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: FolderOpen },
  { id: "documents", label: "Document Verification", icon: FileSearch },
  { id: "compliance", label: "Compliance Engine", icon: ShieldCheck },
  { id: "infrastructure", label: "Infrastructure Review", icon: Building2 },
  { id: "review", label: "Review Queue", icon: UserCheck },
  { id: "reports", label: "Validation Reports", icon: BarChart3 },
  { id: "audit", label: "Audit Trail", icon: History },
  { id: "rules", label: "Rules & Checklists", icon: ListChecks },
  { id: "settings", label: "Settings", icon: Settings },
]

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className="icon-btn"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
function Button({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  disabled,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: typeof Activity
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
function Badge({ value }: { value: string }) {
  const key = value.toLowerCase().replaceAll(" ", "-")
  return (
    <span className={`badge badge-${key}`}>
      <span className="badge-dot" />
      {value}
    </span>
  )
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}
function PageHeader({
  title,
  subtitle,
  children,
  eyebrow,
}: {
  title: string
  subtitle: string
  children?: React.ReactNode
  eyebrow?: string
}) {
  return (
    <div className="page-header">
      <div>
        <div className="breadcrumb">
          AICTE VerifyAI <ChevronRight size={13} /> {eyebrow || title}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">{children}</div>
    </div>
  )
}
function Progress({ value }: { value: number }) {
  return (
    <div className="progress-wrap">
      <div className="progress">
        <span style={{ width: `${value}%` }} />
      </div>
      <b>{value}%</b>
    </div>
  )
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}
function Empty({ title, text }: { title: string text: string }) {
  return (
    <div className="empty">
      <Archive size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
function Select({
  value,
  onChange,
  children,
  label,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="select-wrap">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <ChevronDown size={15} />
    </label>
  )
}
function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys
        .map((k) => `"${String(r[k] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function MiniBars({
  values,
  labels,
  color = "blue",
}: {
  values: number[]
  labels: string[]
  color?: string
}) {
  const max = Math.max(...values)
  return (
    <div className="mini-bars">
      {values.map((v, i) => (
        <div className="bar-row" key={labels[i]}>
          <span>{labels[i]}</span>
          <div>
            <i
              className={`bar-${color}`}
              style={{ width: `${(v / max) * 100}%` }}
            />
          </div>
          <b>{v}</b>
        </div>
      ))}
    </div>
  )
}
function Donut({ value, label }: { value: number label: string }) {
  return (
    <div className="donut-wrap">
      <div
        className="donut"
        style={{ "--value": `${value}%` } as React.CSSProperties}
      >
        <span>
          <b>{value}%</b>
          <small>{label}</small>
        </span>
      </div>
      <div className="legend">
        <span>
          <i className="legend-blue" />
          Completed
        </span>
        <span>
          <i className="legend-light" />
          Outstanding
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("overview")
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("aicte-collapsed") === "true",
  )
  const [mobileNav, setMobileNav] = useState(false)
  const [theme, setTheme] = useState(
    () => localStorage.getItem("aicte-theme") || "light",
  )
  const [applications, setApplications] = useState<Application[]>(
    () =>
      JSON.parse(localStorage.getItem("aicte-apps") || "null") ||
      seedApplications,
  )
  const [documents, setDocuments] = useState<DocumentRecord[]>(
    () =>
      JSON.parse(localStorage.getItem("aicte-docs") || "null") || seedDocuments,
  )
  const [rules, setRules] = useState<Rule[]>(
    () =>
      JSON.parse(localStorage.getItem("aicte-rules") || "null") || seedRules,
  )
  const [cases, setCases] = useState<ReviewCase[]>(
    () =>
      JSON.parse(localStorage.getItem("aicte-cases") || "null") || seedCases,
  )
  const [audit, setAudit] = useState<AuditEvent[]>(
    () =>
      JSON.parse(localStorage.getItem("aicte-audit") || "null") || seedAudit,
  )
  const [toast, setToast] = useState("")
  const [help, setHelp] = useState(false)
  const [profileMenu, setProfileMenu] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [appFilter, setAppFilter] = useState("")

  useEffect(() => {
    localStorage.setItem("aicte-apps", JSON.stringify(applications))
    localStorage.setItem("aicte-docs", JSON.stringify(documents))
    localStorage.setItem("aicte-rules", JSON.stringify(rules))
    localStorage.setItem("aicte-cases", JSON.stringify(cases))
    localStorage.setItem("aicte-audit", JSON.stringify(audit))
  }, [applications, documents, rules, cases, audit])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("aicte-theme", theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem("aicte-collapsed", String(collapsed))
  }, [collapsed])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(""), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const go = (p: Page, filter = "") => {
    setPage(p)
    setAppFilter(filter)
    setSelectedApp(null)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const notify = (message: string) => setToast(message)
  const addAudit = (action: string, target: string, result = "Completed") =>
    setAudit((a) => [
      {
        id: Date.now(),
        time: new Date().toLocaleString("en-IN"),
        user: "Anita Rao",
        role: "Regulatory Officer",
        action,
        target,
        detail: "Action recorded.",
        result,
      },
      ...a,
    ])
  const reset = () => {
    setApplications(seedApplications)
    setDocuments(seedDocuments)
    setRules(seedRules)
    setCases(seedCases)
    setAudit(seedAudit)
    notify("Default records restored")
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileNav ? "mobile-open" : ""
        }`}
      >
        <div className="brand">
          <div className="emblem">
            <Building2 size={21} />
          </div>
          {!collapsed && (
            <div>
              <strong>AICTE VerifyAI</strong>
              <span>Application Validation System</span>
            </div>
          )}
        </div>
        <nav aria-label="Primary navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => go(item.id)}
              title={item.label}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {page === item.id && <i />}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button onClick={() => setHelp(true)} title="Help and Documentation">
            <HelpCircle size={18} />
            <span>Help & Documentation</span>
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="top-left">
            <IconButton
              label="Open menu"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={20} />
            </IconButton>
            <IconButton
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </IconButton>
            <span className="context-label">
              Regulation Bureau
            </span>
          </div>
          <div className="top-right">
            <div className="global-search">
              <Search size={16} />
              <input
                aria-label="Global search"
                placeholder="Search applications, documents..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAppFilter(e.currentTarget.value)
                    go("applications", e.currentTarget.value)
                  }
                }}
              />
            </div>
            <IconButton
              label="Notifications"
              onClick={() => notify("You have 4 alerts")}
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </IconButton>
            <button
              className="profile"
              onClick={() => setProfileMenu(!profileMenu)}
            >
              <span>AR</span>
              <div>
                <b>Anita Rao</b>
                <small>Regulatory Officer</small>
              </div>
              <ChevronDown size={15} />
            </button>
            {profileMenu && (
              <div className="profile-menu">
                <button
                  onClick={() => {
                    go("settings")
                    setProfileMenu(false)
                  }}
                >
                  <Settings size={16} />
                  Profile settings
                </button>
                <button
                  onClick={() => {
                    setHelp(true)
                    setProfileMenu(false)
                  }}
                >
                  <HelpCircle size={16} />
                  Help center
                </button>
              </div>
            )}
          </div>
        </header>
        <main>
          {page === "overview" && (
            <Overview
              apps={applications}
              docs={documents}
              cases={cases}
              go={go}
              setSelectedApp={(a) => {
                setSelectedApp(a)
                setPage("applications")
              }}
              notify={notify}
            />
          )}
          {page === "applications" && (
            <Applications
              apps={applications}
              setApps={setApplications}
              initialSearch={appFilter}
              selected={selectedApp}
              setSelected={setSelectedApp}
              notify={notify}
              addAudit={addAudit}
            />
          )}
          {page === "documents" && (
            <Documents
              documents={documents}
              setDocuments={setDocuments}
              notify={notify}
              addAudit={addAudit}
            />
          )}
          {page === "compliance" && (
            <Compliance
              rules={rules}
              setRules={setRules}
              apps={applications}
              notify={notify}
              addAudit={addAudit}
            />
          )}
          {page === "infrastructure" && (
            <Infrastructure
              apps={applications}
              notify={notify}
              addAudit={addAudit}
            />
          )}
          {page === "review" && (
            <ReviewQueue
              cases={cases}
              setCases={setCases}
              notify={notify}
              addAudit={addAudit}
            />
          )}
          {page === "reports" && (
            <Reports
              apps={applications}
              documents={documents}
              go={go}
              notify={notify}
            />
          )}
          {page === "audit" && <AuditTrail audit={audit} notify={notify} />}
          {page === "rules" && (
            <Rules
              rules={rules}
              setRules={setRules}
              notify={notify}
              resetRules={() => setRules(seedRules)}
            />
          )}
          {page === "settings" && (
            <SettingsPage
              theme={theme}
              setTheme={setTheme}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              reset={reset}
              apps={applications}
              notify={notify}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          <div>
            <b>Action completed</b>
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {help && (
        <Modal title="Help & Documentation" onClose={() => setHelp(false)}>
          <div className="help-grid">
            <div>
              <BookOpen />
              <b>Getting started</b>
              <p>Use the left navigation to move between applications, document checks and compliance reviews.</p>
            </div>
            <div>
              <ShieldCheck />
              <b>Review findings</b>
              <p>Open a finding to inspect its evidence, add notes or send it for further review.</p>
            </div>
            <div>
              <FileText />
              <b>Reports</b>
              <p>Export tables and summaries for further review.</p>
            </div>
          </div>
          <div className="modal-actions">
            <Button onClick={() => setHelp(false)}>Got it</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Overview({
  apps,
  docs,
  cases,
  go,
  setSelectedApp,
  notify,
}: {
  apps: Application[]
  docs: DocumentRecord[]
  cases: ReviewCase[]
  go: (p: Page, f?: string) => void
  setSelectedApp: (a: Application) => void
  notify: (s: string) => void
}) {
  const [period, setPeriod] = useState("Last 30 days")
  const kpis = [
    [
      "Total Applications",
      248,
      "+12.4%",
      FolderOpen,
      "All active application records",
      () => go("applications"),
    ],
    [
      "Pending Validation",
      apps.filter((a) => a.status !== "Completed").length + 32,
      "+5 this week",
      Clock3,
      "Awaiting automated checks",
      () => go("applications", "Processing"),
    ],
    [
      "Documents Verified",
      1284,
      "+86 this month",
      FileCheck2,
      "Across all applications",
      () => go("documents"),
    ],
    [
      "Applications with Deficiencies",
      apps.filter((a) => a.status === "Deficiencies Found").length + 29,
      "-8.2%",
      AlertTriangle,
      "Require rectification",
      () => go("applications", "Deficiencies Found"),
    ],
    [
      "Verification Pending",
      docs.filter((d) => d.status === "Pending Verification").length + 13,
      "4 overdue",
      FileSearch,
      "Authority checks outstanding",
      () => go("documents"),
    ],
    [
      "Requiring Official Review",
      cases.filter((c) => c.status !== "Resolved").length,
      "3 high priority",
      UserCheck,
      "Authorized intervention needed",
      () => go("review"),
    ],
  ] as const
  return (
    <>
      <PageHeader
        title="Regulatory Validation Overview"
        subtitle="Monitor application completeness, document verification and compliance findings."
      >
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={() => notify("Dashboard refreshed with current local data")}
        >
          Refresh
        </Button>
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => downloadCsv("aicte-summary.csv", apps)}
        >
          Export Summary
        </Button>
        <Select label="Reporting period" value={period} onChange={setPeriod}>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Current quarter</option>
        </Select>
      </PageHeader>
      <div className="kpi-grid">
        {kpis.map(([label, value, trend, Icon, desc, action]) => (
          <button
            className="kpi-card"
            key={label as string}
            onClick={action as () => void}
          >
            <div className="kpi-top">
              <span>
                <Icon size={19} />
              </span>
              <small>{trend as string}</small>
            </div>
            <b className="kpi-value">{value as number}</b>
            <strong>{label as string}</strong>
            <p>{desc as string}</p>
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-head">
            <div>
              <h2>Application validation status</h2>
              <p>Current distribution by workflow stage</p>
            </div>
            <MoreHorizontal />
          </div>
          <Donut value={72} label="validated" />
        </Card>
        <Card className="span-2">
          <div className="card-head">
            <div>
              <h2>Applications processed over time</h2>
              <p>{period} · current data</p>
            </div>
            <Badge value="Updated now" />
          </div>
          <div className="line-chart">
            <div className="y-labels">
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <svg viewBox="0 0 600 170" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity=".22" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="area"
                d="M0,145 L85,125 L170,132 L255,92 L340,105 L425,60 L510,72 L600,28 L600,170 L0,170 Z"
              />
              <polyline points="0,145 85,125 170,132 255,92 340,105 425,60 510,72 600,28" />
              <g>
                <circle cx="0" cy="145" r="4" />
                <circle cx="85" cy="125" r="4" />
                <circle cx="170" cy="132" r="4" />
                <circle cx="255" cy="92" r="4" />
                <circle cx="340" cy="105" r="4" />
                <circle cx="425" cy="60" r="4" />
                <circle cx="510" cy="72" r="4" />
                <circle cx="600" cy="28" r="4" />
              </g>
            </svg>
            <div className="x-labels">
              <span>01 Apr</span>
              <span>08 Apr</span>
              <span>15 Apr</span>
              <span>22 Apr</span>
              <span>Today</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Deficiency categories</h2>
              <p>Top findings this period</p>
            </div>
          </div>
          <MiniBars
            values={[18, 14, 11, 8, 5]}
            labels={[
              "Missing evidence",
              "Expired document",
              "Data mismatch",
              "Incomplete record",
              "Other",
            ]}
          />
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Authority outcomes</h2>
              <p>External checks</p>
            </div>
          </div>
          <MiniBars
            values={[48, 22, 12, 7]}
            labels={["Confirmed", "Pending", "Unavailable", "Mismatch"]}
            color="teal"
          />
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>Category distribution</h2>
              <p>Application intake mix</p>
            </div>
          </div>
          <Donut value={42} label="EoA" />
        </Card>
      </div>
      <div className="content-grid">
        <Card className="span-2">
          <div className="card-head">
            <div>
              <h2>Recent applications</h2>
              <p>Latest submissions requiring attention</p>
            </div>
            <Button variant="ghost" onClick={() => go("applications")}>
              View all <ChevronRight size={15} />
            </Button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Institution</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Assigned officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 8).map((a) => (
                  <tr key={a.id} onClick={() => setSelectedApp(a)}>
                    <td>
                      <b className="link">{a.id}</b>
                    </td>
                    <td>
                      <b>{a.institution}</b>
                      <small>{a.programme}</small>
                    </td>
                    <td>{a.category}</td>
                    <td>{a.submitted}</td>
                    <td>
                      <Badge value={a.status} />
                    </td>
                    <td>{a.officer}</td>
                    <td>
                      <button
                        className="table-action"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApp(a)
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="stack">
          <Card>
            <div className="card-head">
              <div>
                <h2>High-priority alerts</h2>
                <p>Immediate review recommended</p>
              </div>
              <span className="count-badge">4</span>
            </div>
            <div className="alert-list">
              <button onClick={() => go("review")}>
                <span className="alert-icon error">
                  <AlertTriangle size={16} />
                </span>
                <div>
                  <b>3 identifier mismatches</b>
                  <small>Across affidavit and accreditation records</small>
                </div>
                <ChevronRight size={16} />
              </button>
              <button onClick={() => go("documents")}>
                <span className="alert-icon warning">
                  <Clock3 size={16} />
                </span>
                <div>
                  <b>1 certificate expired</b>
                  <small>Application AICTE-2025-1045</small>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </Card>
          <Card>
            <div className="card-head">
              <div>
                <h2>Recent activity</h2>
                <p>Live local workflow changes</p>
              </div>
            </div>
            <div className="timeline">
              {[
                "Validation completed for 1048",
                "Document flagged for manual review",
                "Rectification response recorded",
                "Rule configuration updated",
              ].map((x, i) => (
                <div key={x}>
                  <span className={i === 0 ? "done" : ""} />
                  <p>
                    <b>{x}</b>
                    <small>
                      {i + 1} hour{i ? "s" : ""} ago · {officers[i]}
                    </small>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function Applications({
  apps,
  setApps,
  initialSearch,
  selected,
  setSelected,
  notify,
  addAudit,
}: {
  apps: Application[]
  setApps: React.Dispatch<React.SetStateAction<Application[]>>
  initialSearch: string
  selected: Application | null
  setSelected: (a: Application | null) => void
  notify: (s: string) => void
  addAudit: (a: string, t: string, r?: string) => void
}) {
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState("")
  const [category, setCategory] = useState("")
  const [officer, setOfficer] = useState("")
  const [sortAsc, setSortAsc] = useState(false)
  const [pageNo, setPageNo] = useState(1)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [rectify, setRectify] = useState(false)
  const [tab, setTab] = useState("Overview")
  const [comments, setComments] = useState("")
  const visible = useMemo(
    () =>
      apps
        .filter(
          (a) =>
            (!search ||
              Object.values(a)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())) &&
            (!status || a.status === status) &&
            (!category || a.category === category) &&
            (!officer || a.officer === officer),
        )
        .sort((a, b) =>
          sortAsc
            ? a.submitted.localeCompare(b.submitted)
            : b.submitted.localeCompare(a.submitted),
        ),
    [apps, search, status, category, officer, sortAsc],
  )
  const paged = visible.slice((pageNo - 1) * 6, pageNo * 6)
  const update = (id: string, patch: Partial<Application>) => {
    setApps((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    if (selected?.id === id) setSelected({ ...selected, ...patch })
  }
  if (selected)
    return (
      <ApplicationDetail
        app={selected}
        tab={tab}
        setTab={setTab}
        back={() => setSelected(null)}
        update={update}
        rectify={() => setRectify(true)}
        notify={notify}
        addAudit={addAudit}
        rectifyModal={
          rectify ? (
            <Modal
              title="Request Rectification"
              onClose={() => setRectify(false)}
            >
              <div className="form-field">
                <label>Deficiency type *</label>
                <select>
                  <option>Missing supporting evidence</option>
                  <option>Document mismatch</option>
                  <option>Expired certificate</option>
                </select>
              </div>
              <div className="form-field">
                <label>Comments *</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describe the required correction..."
                />
              </div>
              <div className="modal-actions">
                <Button variant="secondary" onClick={() => setRectify(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!comments.trim()}
                  onClick={() => {
                    update(selected.id, { status: "Deficiencies Found" })
                    addAudit(
                      "Rectification requested",
                      selected.id,
                      "Awaiting institution",
                    )
                    setRectify(false)
                    setComments("")
                    notify("Application moved to Deficiencies Found")
                  }}
                >
                  Confirm request
                </Button>
              </div>
            </Modal>
          ) : null
        }
      />
    )
  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Review and validate institutional approval applications."
      >
        <Button
          variant="secondary"
          icon={Plus}
          onClick={() => {
            const n = {
              ...seedApplications[0],
              id: `AICTE-2025-${1050 + apps.length}`,
              institution: "Institute of Emerging Technology",
              status: "Submitted" as AppStatus,
              progress: 12,
            }
            setApps([n, ...apps])
            notify("Application added")
          }}
        >
          Add Application
        </Button>
        <Button
          variant="secondary"
          icon={UploadCloud}
          onClick={() => notify("Records are already loaded")}
        >
          Import Dataset
        </Button>
        <Button
          icon={Download}
          onClick={() => downloadCsv("applications.csv", visible)}
        >
          Export Applications
        </Button>
      </PageHeader>
      <Card className="filter-card">
        <div className="filter-row">
          <div className="search-input">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPageNo(1)
              }}
              placeholder="Search ID, institution or programme..."
            />
          </div>
          <Select label="Category" value={category} onChange={setCategory}>
            <option value="">All categories</option>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Select label="Status" value={status} onChange={setStatus}>
            <option value="">All statuses</option>
            {appStatuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Select label="Officer" value={officer} onChange={setOfficer}>
            <option value="">All officers</option>
            {officers.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Button
            variant="ghost"
            icon={X}
            onClick={() => {
              setSearch("")
              setCategory("")
              setStatus("")
              setOfficer("")
            }}
          >
            Clear
          </Button>
        </div>
      </Card>
      {selectedRows.length > 0 && (
        <div className="bulk-bar">
          <b>{selectedRows.length} selected</b>
          <Button
            variant="secondary"
            onClick={() => {
              setApps((list) =>
                list.map((a) =>
                  selectedRows.includes(a.id)
                    ? { ...a, officer: "Anita Rao" }
                    : a,
                ),
              )
              notify("Selected applications assigned to Anita Rao")
            }}
          >
            Assign Officer
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv(
                "selected-applications.csv",
                apps.filter((a) => selectedRows.includes(a.id)),
              )
            }
          >
            Export selection
          </Button>
          <button onClick={() => setSelectedRows([])}>
            <X size={16} />
          </button>
        </div>
      )}
      <Card className="table-card">
        <div className="table-meta">
          <div>
            <h2>Application register</h2>
            <p>{visible.length} records in current view</p>
          </div>
          <button className="sort-btn" onClick={() => setSortAsc(!sortAsc)}>
            <ChevronsUpDown size={15} /> Submitted date
          </button>
        </div>
        {visible.length ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={paged.every((a) =>
                          selectedRows.includes(a.id),
                        )}
                        onChange={(e) =>
                          setSelectedRows(
                            e.target.checked
                              ? [
                                  ...new Set([
                                    ...selectedRows,
                                    ...paged.map((a) => a.id),
                                  ]),
                                ]
                              : selectedRows.filter(
                                  (x) => !paged.some((a) => a.id === x),
                                ),
                          )
                        }
                      />
                    </th>
                    <th>Application</th>
                    <th>Category</th>
                    <th>Submitted</th>
                    <th>Documents</th>
                    <th>Validation progress</th>
                    <th>Status</th>
                    <th>Assigned officer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((a) => (
                    <tr key={a.id} onClick={() => setSelected(a)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${a.id}`}
                          checked={selectedRows.includes(a.id)}
                          onChange={(e) =>
                            setSelectedRows(
                              e.target.checked
                                ? [...selectedRows, a.id]
                                : selectedRows.filter((x) => x !== a.id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <b className="link">{a.id}</b>
                        <small>{a.institution}</small>
                      </td>
                      <td>{a.category}</td>
                      <td>{a.submitted}</td>
                      <td>
                        <b>{a.docs}</b> files
                      </td>
                      <td>
                        <Progress value={a.progress} />
                      </td>
                      <td>
                        <Badge value={a.status} />
                      </td>
                      <td>
                        <span className="officer">
                          <i>
                            {a.officer
                              .split(" ")
                              .map((x) => x[0])
                              .join("")}
                          </i>
                          {a.officer}
                        </span>
                      </td>
                      <td>
                        <button className="table-action">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                Showing {(pageNo - 1) * 6 + 1}–
                {Math.min(pageNo * 6, visible.length)} of {visible.length}
              </span>
              <div>
                <IconButton
                  label="Previous"
                  onClick={() => setPageNo(Math.max(1, pageNo - 1))}
                >
                  <ChevronLeft size={17} />
                </IconButton>
                <b>{pageNo}</b>
                <IconButton
                  label="Next"
                  onClick={() =>
                    setPageNo(
                      Math.min(Math.ceil(visible.length / 6), pageNo + 1),
                    )
                  }
                >
                  <ChevronRight size={17} />
                </IconButton>
              </div>
            </div>
          </>
        ) : (
          <Empty
            title="No applications found"
            text="Try clearing one or more filters."
          />
        )}
      </Card>
    </>
  )
}

function ApplicationDetail({
  app,
  tab,
  setTab,
  back,
  update,
  rectify,
  notify,
  addAudit,
  rectifyModal,
}: {
  app: Application
  tab: string
  setTab: (s: string) => void
  back: () => void
  update: (id: string, p: Partial<Application>) => void
  rectify: () => void
  notify: (s: string) => void
  addAudit: (a: string, t: string, r?: string) => void
  rectifyModal: React.ReactNode
}) {
  const [running, setRunning] = useState(false)
  const run = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      update(app.id, { progress: 86, status: "Ready for Review" })
      addAudit("Validation executed", app.id)
      notify("Validation completed")
    }, 1200)
  }
  return (
    <>
      <button className="back-link" onClick={back}>
        <ChevronLeft size={16} /> Back to Applications
      </button>
      <PageHeader
        title={app.id}
        eyebrow="Applications"
        subtitle={`${app.institution} · ${app.category}`}
      >
        <Button variant="secondary" onClick={rectify}>
          Request Rectification
        </Button>
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => downloadCsv(`${app.id}.csv`, [app])}
        >
          Export Report
        </Button>
        <Button icon={ShieldCheck} onClick={run}>
          {running ? "Validating…" : "Run Validation"}
        </Button>
      </PageHeader>
      <div className="detail-banner">
        <div className="institution-icon">
          <Building2 />
        </div>
        <div>
          <span className="eyebrow">Institution profile</span>
          <h2>{app.institution}</h2>
          <p>
            {app.district} · Institution ID INST-{app.id.slice(-4)} ·{" "}
            {app.programme}
          </p>
        </div>
        <Badge value={app.status} />
      </div>
      <div className="tabs">
        {["Overview", "Documents", "Validation", "Compliance", "History"].map(
          (x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ),
        )}
      </div>
      {tab === "Overview" && (
        <div className="detail-grid">
          <Card className="span-2">
            <div className="card-head">
              <div>
                <h2>Application information</h2>
                <p>Submitted institutional approval record</p>
              </div>
            </div>
            <div className="info-grid">
              {[
                ["Application category", app.category],
                ["Submission date", app.submitted],
                ["Programme", app.programme],
                ["Proposed intake", `${app.intake} seats`],
                ["Assigned officer", app.officer],
                ["Payment status", "Payment confirmed"],
              ].map(([a, b]) => (
                <div key={a}>
                  <span>{a}</span>
                  <b>{b}</b>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2>Validation readiness</h2>
            <div className="readiness">
              <strong>{app.progress}%</strong>
              <Progress value={app.progress} />
              <p>
                {app.docs} documents submitted. Two checks may require human
                review.
              </p>
            </div>
          </Card>
          <Card>
            <h2>Approval history</h2>
            <div className="timeline compact">
              <div>
                <span className="done" />
                <p>
                  <b>Previous EoA recorded</b>
                  <small>Academic year 2024–25</small>
                </p>
              </div>
              <div>
                <span />
                <p>
                  <b>No unresolved prior finding</b>
                  <small>Institution record</small>
                </p>
              </div>
            </div>
          </Card>
          <Card className="span-2">
            <h2>Approved programmes and intake</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Level</th>
                    <th>Current intake</th>
                    <th>Submitted intake</th>
                    <th>Record check</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <b>{app.programme}</b>
                    </td>
                    <td>Undergraduate</td>
                    <td>{app.intake}</td>
                    <td>{app.intake}</td>
                    <td>
                      <Badge value="Matched" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {tab === "Documents" && (
        <Card>
          <div className="card-head">
            <div>
              <h2>Submitted documents</h2>
              <p>Document set linked to this application</p>
            </div>
          </div>
          <div className="document-cards">
            {docNames.slice(0, 6).map((d, i) => (
              <div key={d}>
                <FileText size={20} />
                <span>
                  <b>{d}</b>
                  <small>PDF · {1 + i * 0.3} MB</small>
                </span>
                <Badge value={i === 2 ? "Pending Verification" : "Verified"} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {tab === "Validation" && (
        <div className="detail-grid">
          <Card className="span-2">
            <h2>Validation findings</h2>
            {[
              "Institution identifiers consistent",
              "Programme data matches prior approval",
              "Fire certificate requires authority confirmation",
            ].map((x, i) => (
              <div className="finding" key={x}>
                <span className={i === 2 ? "warning" : "success"}>
                  {i === 2 ? <AlertTriangle /> : <Check />}
                </span>
                <div>
                  <b>{x}</b>
                  <p>
                    {i === 2
                      ? "Human review recommended. Source check is pending."
                      : "Check passed."}
                  </p>
                </div>
                <Badge value={i === 2 ? "Review Required" : "Passed"} />
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab === "Compliance" && (
        <Card>
          <h2>Checklist summary</h2>
          <div className="summary-strip">
            <div>
              <b>15</b>
              <span>Rules evaluated</span>
            </div>
            <div>
              <b className="success-text">11</b>
              <span>Passed</span>
            </div>
            <div>
              <b className="error-text">1</b>
              <span>Failed</span>
            </div>
            <div>
              <b className="warning-text">3</b>
              <span>Human review</span>
            </div>
          </div>
        </Card>
      )}
      {tab === "History" && (
        <Card>
          <h2>Activity history</h2>
          <div className="timeline">
            {[
              "Application submitted",
              "Document set indexed",
              "Completeness check completed",
              "Assigned to officer",
            ].map((x, i) => (
              <div key={x}>
                <span className="done" />
                <p>
                  <b>{x}</b>
                  <small>
                    April {18 + i}, 2025 ·{" "}
                    {i === 3 ? app.officer : "System"}
                  </small>
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="sticky-actions">
        <span>
          <Info size={16} /> Final approval and rejection remain with the authorized officer.
        </span>
        <Button
          variant="secondary"
          onClick={() => {
            update(app.id, {
              officer:
                officers[(officers.indexOf(app.officer) + 1) % officers.length],
            })
            notify("Officer assignment updated")
          }}
        >
          Assign Officer
        </Button>
        <Button
          onClick={() => {
            update(app.id, { status: "Ready for Review", progress: 100 })
            notify("Application marked Ready for Review")
          }}
        >
          Mark Ready for Review
        </Button>
      </div>
      {rectifyModal}
    </>
  )
}

function Documents({
  documents,
  setDocuments,
  notify,
  addAudit,
}: {
  documents: DocumentRecord[]
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>>
  notify: (s: string) => void
  addAudit: (a: string, t: string, r?: string) => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [selectedId, setSelectedId] = useState(documents[0].id)
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [tab, setTab] = useState("Extracted Data")
  const [zoom, setZoom] = useState(100)
  const [ocr, setOcr] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const selected = documents.find((d) => d.id === selectedId) || documents[0]
  const addFiles = (list: FileList | null) => {
    if (!list) return
    const valid = Array.from(list).filter((f) => f.size <= 10 * 1024 * 1024)
    setFiles((f) => [...f, ...valid])
    notify(`${valid.length} file(s) added to workspace`)
  }
  const setDocStatus = (value: DocStatus) => {
    setDocuments((ds) =>
      ds.map((d) => (d.id === selected.id ? { ...d, status: value } : d)),
    )
    addAudit("Verification result recorded", selected.id, value)
    notify(`Document marked ${value}`)
  }
  return (
    <>
      <PageHeader
        title="Document Verification"
        subtitle="Examine uploaded documents, extracted information and verification results."
      >
      </PageHeader>
      <div
        className="upload-card"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          onChange={(e) => addFiles(e.target.files)}
        />
        <UploadCloud size={30} />
        <div>
          <h2>Drag files here for local inspection</h2>
          <p>
            PDF, DOCX, PNG, JPG or JPEG · Maximum 10 MB per file · Files never
            leave your browser
          </p>
        </div>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          Browse Files
        </Button>
      </div>
      {files.length > 0 && (
        <Card>
          <div className="card-head">
            <div>
              <h2>Uploaded files</h2>
              <p>
                {files.length} uploaded file(s) · extraction preview available
              </p>
            </div>
            <Button variant="ghost" onClick={() => setFiles([])}>
              Clear All
            </Button>
          </div>
          <div className="file-list">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`}>
                <FileText size={19} />
                <span>
                  <b>{f.name}</b>
                  <small>
                    {(f.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                    {f.type || "Unknown type"}
                  </small>
                </span>
                <div className="upload-progress">
                  <i />
                  <small>Ready</small>
                </div>
                <IconButton
                  label={`Remove ${f.name}`}
                  onClick={() => setFiles((x) => x.filter((_, n) => n !== i))}
                >
                  <X size={17} />
                </IconButton>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card className="filter-card">
        <div className="filter-row">
          <div className="search-input">
            <Search size={17} />
            <input placeholder="Search document library..." />
          </div>
          <Select
            label="Document type"
            value={typeFilter}
            onChange={setTypeFilter}
          >
            <option value="">All document types</option>
            {docNames.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <option value="">All statuses</option>
            {docStatusList.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Button
            variant="ghost"
            icon={X}
            onClick={() => {
              setStatusFilter("")
              setTypeFilter("")
            }}
          >
            Clear
          </Button>
        </div>
      </Card>
      <div className="doc-layout">
        <Card className="doc-library">
          <div className="card-head">
            <div>
              <h2>Document library</h2>
              <p>30 document records</p>
            </div>
          </div>
          <div className="doc-list">
            {documents
              .filter(
                (d) =>
                  (!statusFilter || d.status === statusFilter) &&
                  (!typeFilter || d.type === typeFilter),
              )
              .map((d) => (
                <button
                  key={d.id}
                  className={selected.id === d.id ? "active" : ""}
                  onClick={() => setSelectedId(d.id)}
                >
                  <span className="doc-icon">
                    <FileText />
                  </span>
                  <span>
                    <b>{d.name}</b>
                    <small>
                      {d.appId} · {d.uploaded}
                    </small>
                    <Badge value={d.status} />
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
          </div>
        </Card>
        <div className="inspection">
          <Card className="preview-card">
            <div className="preview-toolbar">
              <span>
                <FileText size={17} /> {selected.name}.pdf
              </span>
              <div>
                <IconButton
                  label="Zoom out"
                  onClick={() => setZoom(Math.max(60, zoom - 10))}
                >
                  <ZoomOut size={17} />
                </IconButton>
                <b>{zoom}%</b>
                <IconButton
                  label="Zoom in"
                  onClick={() => setZoom(Math.min(140, zoom + 10))}
                >
                  <ZoomIn size={17} />
                </IconButton>
                <IconButton
                  label="Download document"
                  onClick={() =>
                    notify("No source file is attached to this preview")
                  }
                >
                  <Download size={17} />
                </IconButton>
              </div>
            </div>
            <div className="document-preview">
              <div style={{ transform: `scale(${zoom / 100})` }}>
                <div className="preview-seal">
                  <Building2 />
                </div>
                <h3>{selected.name.toUpperCase()}</h3>
                <p>Document preview</p>
                <hr />
                <div className="preview-fields">
                  <span>Institution</span>
                  <b>{selected.institution}</b>
                  <span>Reference</span>
                  <b>{selected.ref}</b>
                  <span>Issue date</span>
                  <b>01 April 2025</b>
                  <span>Valid until</span>
                  <b>{selected.expiry}</b>
                </div>
                <div className="preview-sign">
                  Digital signature
                </div>
              </div>
            </div>
            <div className="page-controls">
              <ChevronLeft size={16} />
              <span>Page 1 of 2</span>
              <ChevronRight size={16} />
            </div>
          </Card>
          <Card className="extraction">
            <div className="extraction-head">
              <div>
                <h2>Document intelligence</h2>
              </div>
              <div className="confidence">
                <b>{selected.confidence}%</b>
                <span>Confidence</span>
              </div>
            </div>
            <div className="tabs compact-tabs">
              {["Extracted Data", "Verification", "Anomalies", "History"].map(
                (x) => (
                  <button
                    className={tab === x ? "active" : ""}
                    onClick={() => setTab(x)}
                    key={x}
                  >
                    {x}
                  </button>
                ),
              )}
            </div>
            {tab === "Extracted Data" && (
              <div className="extracted-grid">
                {[
                  ["Institution name", selected.institution],
                  ["Reference number", selected.ref],
                  ["Issue date", "01 April 2025"],
                  ["Expiry date", selected.expiry],
                  ["Issuing authority", selected.authority],
                  ["Extracted identifier", `INST-${selected.appId.slice(-4)}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{ocr ? v : `${v}`}</b>
                    <small>
                      {ocr ? "Updated by OCR" : "Available extraction data"}
                    </small>
                  </div>
                ))}
              </div>
            )}
            {tab === "Verification" && (
              <div className="verification-panel">
                <Badge value={selected.status} />
                <p>Authority verification details are shown below.</p>
                <div className="check-row">
                  <CheckCircle2 />
                  <span>
                    <b>Document format check</b>
                    <small>
                      Document structure detected
                    </small>
                  </span>
                </div>
                <div className="check-row warning">
                  <AlertTriangle />
                  <span>
                    <b>Authority reference</b>
                    <small>External source unavailable</small>
                  </span>
                </div>
              </div>
            )}
            {tab === "Anomalies" && (
              <div className="finding">
                <span className="warning">
                  <AlertTriangle />
                </span>
                <div>
                  <b>Reference formatting requires review</b>
                  <p>
                    Reference format differs from the configured rule.
                  </p>
                </div>
              </div>
            )}
            {tab === "History" && (
              <div className="timeline compact">
                <div>
                  <span className="done" />
                  <p>
                    <b>Document uploaded</b>
                    <small>{selected.uploaded}</small>
                  </p>
                </div>
                <div>
                  <span />
                  <p>
                    <b>Extraction details ready</b>
                    <small>Verification response</small>
                  </p>
                </div>
              </div>
            )}
            <div className="action-grid">
              <Button
                variant="secondary"
                icon={FileSearch}
                onClick={() => {
                  setOcr(true)
                  notify("Extraction results refreshed")
                }}
              >
                Run OCR
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  notify("Institutional record comparison completed")
                }
              >
                Compare Record
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  notify("Reference check unavailable")
                }
              >
                Check Reference
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDocStatus("Manual Review Required")}
              >
                Flag Manual Review
              </Button>
              <Button onClick={() => setDocStatus("Verified")}>
                Mark Verified
              </Button>
              <Button
                variant="danger"
                onClick={() => setDocStatus("Mismatch Detected")}
              >
                Mark Mismatch
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function Compliance({
  rules,
  setRules,
  apps,
  notify,
  addAudit,
}: {
  rules: Rule[]
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>
  apps: Application[]
  notify: (s: string) => void
  addAudit: (a: string, t: string, r?: string) => void
}) {
  const [edit, setEdit] = useState<Rule | null>(null)
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [appId, setAppId] = useState(apps[0].id)
  const run = () => {
    setRunning(true)
    setRan(false)
    setTimeout(() => {
      setRunning(false)
      setRan(true)
      addAudit("Validation executed", appId)
      notify("15 deterministic rules evaluated")
    }, 1400)
  }
  return (
    <>
      <PageHeader
        title="Regulatory Compliance Engine"
        subtitle="Evaluate applications against configurable regulatory checklists."
      >
        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          onClick={() =>
            notify(
              "Open Rules & Checklists from the sidebar for full configuration",
            )
          }
        >
          Manage Rules
        </Button>
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => downloadCsv("compliance-findings.csv", rules)}
        >
          Export Findings
        </Button>
        <Button icon={ShieldCheck} onClick={run}>
          {running ? "Running…" : "Run Validation"}
        </Button>
      </PageHeader>
      <Card className="validation-launch">
        <div>
          <span className="eyebrow">Validation target</span>
          <h2>Select an application</h2>
          <p>Results are based on the available application records.</p>
        </div>
        <Select label="Application" value={appId} onChange={setAppId}>
          {apps.map((a) => (
            <option value={a.id} key={a.id}>
              {a.id} — {a.institution}
            </option>
          ))}
        </Select>
        {running && (
          <div className="loading-line">
            <span />
          </div>
        )}
      </Card>
      <div className="summary-grid">
        {[
          ["Rules Evaluated", ran ? 15 : "—", ClipboardCheck],
          ["Passed Checks", ran ? 11 : "—", CheckCircle2],
          ["Failed Checks", ran ? 1 : "—", XCircle],
          ["Warnings", ran ? 2 : "—", AlertTriangle],
          ["Human Review", ran ? 1 : "—", UserCheck],
        ].map(([x, v, I]) => (
          <Card key={x as string}>
            <span className="summary-icon">
              <I size={18} />
            </span>
            <b>{v as string | number}</b>
            <p>{x as string}</p>
          </Card>
        ))}
      </div>
      {ran && (
        <Card>
          <div className="card-head">
            <div>
              <h2>Validation results</h2>
              <p>Findings for {appId}</p>
            </div>
          </div>
          {[
            "Institutional affidavit present",
            "Identifiers consistent across documents",
            "Accreditation certificate reference requires review",
            "Payment record confirmed",
          ].map((x, i) => (
            <div className="finding" key={x}>
              <span className={i === 2 ? "warning" : "success"}>
                {i === 2 ? <AlertTriangle /> : <Check />}
              </span>
              <div>
                <b>{x}</b>
                <p>
                  {i === 2
                    ? "Human verification recommended; source is unavailable."
                    : "Check passed using the available application evidence."}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => notify(`Evidence viewer opened for: ${x}`)}
              >
                View Evidence
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  notify(
                    i === 2 ? "Finding escalated" : "Finding marked reviewed",
                  )
                }
              >
                {i === 2 ? "Escalate" : "Mark Reviewed"}
              </Button>
            </div>
          ))}
        </Card>
      )}
      <Card className="table-card">
        <div className="card-head">
          <div>
            <h2>Configured rules</h2>
            <p>
              {rules.filter((r) => r.enabled).length} active of {rules.length}{" "}
              configured rules
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Requirement</th>
                <th>Category</th>
                <th>Evidence required</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Last updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.id}</b>
                  </td>
                  <td>
                    <b>{r.name}</b>
                    <small>{r.source}</small>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.evidence}</td>
                  <td>
                    <Badge value={r.enabled ? "Enabled" : "Disabled"} />
                  </td>
                  <td>
                    <Badge value={r.severity} />
                  </td>
                  <td>{r.updated}</td>
                  <td>
                    <button className="table-action" onClick={() => setEdit(r)}>
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {edit && (
        <Modal
          title={`Configure ${edit.id}`}
          onClose={() => setEdit(null)}
          wide
        >
          <div className="modal-grid">
            <div className="form-field span-2">
              <label>Display name</label>
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Applicable category</label>
              <select
                value={edit.category}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              >
                <option>All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Severity</label>
              <select
                value={edit.severity}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    severity: e.target.value as Rule["severity"],
                  })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="form-field span-2">
              <label>Configurable source / reference</label>
              <input
                value={edit.source}
                onChange={(e) => setEdit({ ...edit, source: e.target.value })}
              />
            </div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={edit.enabled}
                onChange={(e) =>
                  setEdit({ ...edit, enabled: e.target.checked })
                }
              />
              <span />
              <div>
                <b>Rule enabled</b>
                <small>Include in evaluations</small>
              </div>
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setRules((rs) =>
                  rs.map((r) =>
                    r.id === edit.id ? { ...edit, updated: "2025-04-26" } : r,
                  ),
                )
                addAudit("Rule updated", edit.id)
                setEdit(null)
                notify("Rule configuration saved locally")
              }}
            >
              Save changes
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Infrastructure({
  apps,
  notify,
  addAudit,
}: {
  apps: Application[]
  notify: (s: string) => void
  addAudit: (a: string, t: string, r?: string) => void
}) {
  const [appId, setAppId] = useState(apps[0].id)
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [modal, setModal] = useState("")
  const app = apps.find((a) => a.id === appId)!
  const run = () => {
    setRunning(true)
    setRan(false)
    setTimeout(() => {
      setRunning(false)
      setRan(true)
      addAudit("Visual inspection completed", appId)
      notify("Visual review is ready")
    }, 1400)
  }
  return (
    <>
      <PageHeader
        title="Infrastructure Review"
        subtitle="Review supporting evidence and identify cases requiring further scrutiny."
      >
        <Button icon={Image} onClick={run}>
          {running ? "Analysing…" : "Run Visual Inspection"}
        </Button>
      </PageHeader>
      <div className="infra-layout">
        <div className="stack">
          <Card>
            <label className="eyebrow">Application selector</label>
            <Select label="Application" value={appId} onChange={setAppId}>
              {apps.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.id}
                </option>
              ))}
            </Select>
            <div className="institution-summary">
              <Building2 />
              <div>
                <b>{app.institution}</b>
                <span>{app.district} · Main academic block</span>
              </div>
            </div>
          </Card>
          <Card>
            <h2>Required evidence checklist</h2>
            {[
              "Building evidence supplied",
              "Floor plan available",
              "Relevant safety certificate supplied",
              "Room or facility labels present",
              "Supporting evidence complete",
            ].map((x, i) => (
              <label className="check-item" key={x}>
                <input type="checkbox" defaultChecked={i < 4} />
                <span>{i < 4 ? <Check /> : null}</span>
                <b>{x}</b>
                <small>{i < 4 ? "Evidence linked" : "Review required"}</small>
              </label>
            ))}
          </Card>
        </div>
        <div className="stack">
          <Card>
            <div className="card-head">
              <div>
                <h2>Submitted evidence</h2>
                <p>Campus and facility records</p>
              </div>
              <Badge value="6 Items" />
            </div>
            <div className="evidence-gallery">
              <button className="featured">
                <div className="building-art">
                  <Building2 />
                </div>
                <span>
                  <b>Main academic block</b>
                  <small>Campus photograph</small>
                </span>
              </button>
              <button>
                <div className="plan-art">
                  <i />
                  <i />
                  <i />
                </div>
                <span>
                  <b>Ground floor plan</b>
                  <small>Floor plan</small>
                </span>
              </button>
              <button>
                <div className="video-art">
                  <Image />
                </div>
                <span>
                  <b>Facility walkthrough</b>
                  <small>Video placeholder</small>
                </span>
              </button>
            </div>
          </Card>
          {running && (
            <Card className="analysis-loading">
              <div className="spinner" />
              <div>
                <b>Reviewing evidence</b>
                <p>
                  Checking image quality and configurable visual indicators…
                </p>
              </div>
            </Card>
          )}
          {ran && (
            <Card>
              <div className="card-head">
                <div>
                  <h2>Observations</h2>
                </div>
                <Badge value="Review Required" />
              </div>
              {[
                "Documented room labels require confirmation",
                "Image quality is insufficient for reliable review",
                "Manual inspection recommended",
              ].map((x, i) => (
                <div className="observation" key={x}>
                  <span>{i + 1}</span>
                  <div>
                    <b>{x}</b>
                    <p>
                      {i === 0
                        ? "Labels are partially visible but cannot be reliably matched to the floor plan."
                        : "Additional evidence may be required before an official conclusion."}
                    </p>
                    <small>
                      Confidence: {78 - i * 9}% · Evidence: Campus image {i + 1}{" "}
                      · Review required: Yes
                    </small>
                  </div>
                </div>
              ))}
            </Card>
          )}
          <Card>
            <h2>Reviewer observations</h2>
            <textarea placeholder="Add an observation about the submitted evidence…" />
            <div className="button-row">
              <Button
                variant="secondary"
                onClick={() => setModal("Add observation")}
              >
                Add Observation
              </Button>
              <Button
                variant="secondary"
                onClick={() => setModal("Request additional evidence")}
              >
                Request Additional Evidence
              </Button>
              <Button
                variant="secondary"
                onClick={() => setModal("Escalate for inspection")}
              >
                Escalate for Inspection
              </Button>
              <Button
                onClick={() => notify("Infrastructure review marked complete")}
              >
                Mark Reviewed
              </Button>
            </div>
          </Card>
        </div>
      </div>
      {modal && (
        <Modal title={modal} onClose={() => setModal("")}>
          <div className="form-field">
            <label>Officer note *</label>
            <textarea
              id="infra-note"
              placeholder="Record the reason and next step…"
            />
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setModal("")}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                addAudit(modal, appId)
                setModal("")
                notify(`${modal} recorded`)
              }}
            >
              Confirm action
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function ReviewQueue({
  cases,
  setCases,
  notify,
  addAudit,
}: {
  cases: ReviewCase[]
  setCases: React.Dispatch<React.SetStateAction<ReviewCase[]>>
  notify: (s: string) => void
  addAudit: (a: string, t: string, r?: string) => void
}) {
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("")
  const [selected, setSelected] = useState<ReviewCase | null>(null)
  const [action, setAction] = useState("")
  const [notes, setNotes] = useState("")
  const visible = cases.filter(
    (c) =>
      (!search ||
        Object.values(c)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!priority || c.priority === priority) &&
      (!status || c.status === status),
  )
  const commit = () => {
    if (!selected) return
    const next = action.includes("Resolve")
      ? "Resolved"
      : action.includes("Escalate")
        ? "Escalated"
        : action.includes("Additional") || action.includes("Clarification")
          ? "Awaiting Rectification"
          : "Confirmed"
    setCases((cs) =>
      cs.map((c) =>
        c.id === selected.id
          ? { ...c, status: next, notes: notes || c.notes }
          : c,
      ),
    )
    addAudit(action, selected.id, next)
    setSelected({ ...selected, status: next, notes })
    setAction("")
    setNotes("")
    notify(`${action} completed`)
  }
  if (selected)
    return (
      <>
        <button className="back-link" onClick={() => setSelected(null)}>
          <ChevronLeft size={16} /> Back to Review Queue
        </button>
        <PageHeader
          title={selected.id}
          eyebrow="Official Review Queue"
          subtitle={`${selected.institution} · ${selected.appId}`}
        >
          <Badge value={selected.priority + " Priority"} />
        </PageHeader>
        <div className="case-grid">
          <Card>
            <span className="eyebrow">Original finding</span>
            <h2>{selected.finding}</h2>
            <p className="body-copy">
              Triggered by RULE-006: Institution identifiers must be consistent
              across submitted evidence.
            </p>
            <div className="value-compare">
              <div>
                <span>Extracted value</span>
                <b>INST-{selected.appId.slice(-4)}A</b>
              </div>
              <AlertTriangle />
              <div>
                <span>Expected value</span>
                <b>INST-{selected.appId.slice(-4)}</b>
              </div>
            </div>
          </Card>
          <Card>
            <h2>Case summary</h2>
            <div className="info-list">
              <span>
                Review status <Badge value={selected.status} />
              </span>
              <span>
                Assigned officer <b>{selected.officer}</b>
              </span>
              <span>
                Date flagged <b>{selected.date}</b>
              </span>
              <span>
                Evidence references <b>{selected.evidence} linked items</b>
              </span>
            </div>
          </Card>
          <Card className="span-2">
            <h2>Evidence references</h2>
            <div className="evidence-links">
              {[
                "Institutional Affidavit.pdf",
                "Accreditation Certificate.pdf",
                "Application Master Record",
              ].map((x) => (
                <button key={x} onClick={() => notify(`Evidence opened: ${x}`)}>
                  <FileText />
                  <span>
                    <b>{x}</b>
                    <small>Evidence record</small>
                  </span>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h2>Officer notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record review observations…"
            />
          </Card>
          <Card>
            <h2>Decision history</h2>
            <div className="timeline compact">
              <div>
                <span className="done" />
                <p>
                  <b>Finding created</b>
                  <small>{selected.date} · Validation engine</small>
                </p>
              </div>
              <div>
                <span />
                <p>
                  <b>Assigned to {selected.officer}</b>
                  <small>Pending officer decision</small>
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div className="sticky-actions">
          <span>
            <Info size={16} /> This workspace does not approve or reject
            institutions.
          </span>
          <Button
            variant="secondary"
            onClick={() => setAction("Request Additional Evidence")}
          >
            Request Evidence
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAction("Escalate for Manual Verification")}
          >
            Escalate
          </Button>
          <Button variant="danger" onClick={() => setAction("Confirm Finding")}>
            Confirm Finding
          </Button>
          <Button onClick={() => setAction("Resolve Finding")}>
            Resolve Finding
          </Button>
        </div>
        {action && (
          <Modal title={action} onClose={() => setAction("")}>
            <p className="body-copy">
              This action will update the case
              status and add an audit event.
            </p>
            <div className="form-field">
              <label>Decision note *</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide a concise rationale…"
              />
            </div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setAction("")}>
                Cancel
              </Button>
              <Button disabled={!notes.trim()} onClick={commit}>
                Confirm action
              </Button>
            </div>
          </Modal>
        )}
      </>
    )
  return (
    <>
      <PageHeader
        title="Official Review Queue"
        subtitle="Resolve discrepancies and review cases requiring authorized intervention."
      />
      <div className="summary-grid">
        {[
          ["High Priority", cases.filter((c) => c.priority === "High").length],
          ["Pending Manual Verification", 5],
          ["Potential Anomalies", 7],
          [
            "Awaiting Rectification",
            cases.filter((c) => c.status === "Awaiting Rectification").length,
          ],
          [
            "Ready for Review",
            cases.filter((c) => c.status === "Ready for Review").length,
          ],
        ].map(([x, v], i) => (
          <Card key={x as string}>
            <span className={`summary-icon ${i === 0 ? "danger" : ""}`}>
              <UserCheck size={18} />
            </span>
            <b>{v as number}</b>
            <p>{x as string}</p>
          </Card>
        ))}
      </div>
      <Card className="filter-card">
        <div className="filter-row">
          <div className="search-input">
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases or institutions..."
            />
          </div>
          <Select label="Priority" value={priority} onChange={setPriority}>
            <option value="">All priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </Select>
          <Select label="Status" value={status} onChange={setStatus}>
            <option value="">All statuses</option>
            {[...new Set(cases.map((c) => c.status))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setPriority("")
              setStatus("")
            }}
          >
            Clear
          </Button>
        </div>
      </Card>
      <Card className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Application</th>
                <th>Finding</th>
                <th>Evidence</th>
                <th>Assigned officer</th>
                <th>Date flagged</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)}>
                  <td>
                    <Badge value={c.priority} />
                  </td>
                  <td>
                    <b className="link">{c.appId}</b>
                    <small>{c.institution}</small>
                  </td>
                  <td>{c.finding}</td>
                  <td>{c.evidence} items</td>
                  <td>{c.officer}</td>
                  <td>{c.date}</td>
                  <td>
                    <Badge value={c.status} />
                  </td>
                  <td>
                    <button className="table-action">Open Case</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function Reports({
  apps,
  documents,
  go,
  notify,
}: {
  apps: Application[]
  documents: DocumentRecord[]
  go: (p: Page, f?: string) => void
  notify: (s: string) => void
}) {
  const [period, setPeriod] = useState("Current quarter")
  const [status, setStatus] = useState("")
  const [generated, setGenerated] = useState(new Date().toLocaleString("en-IN"))
  const filtered = apps.filter((a) => !status || a.status === status)
  return (
    <>
      <PageHeader
        title="Validation Reports"
        subtitle="View validation outcomes, outstanding deficiencies and verification performance."
      >
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => downloadCsv("validation-report.csv", filtered)}
        >
          Export CSV
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Print Report
        </Button>
        <Button
          icon={BarChart3}
          onClick={() => {
            setGenerated(new Date().toLocaleString("en-IN"))
            notify("Report regenerated with current filters")
          }}
        >
          Generate Report
        </Button>
      </PageHeader>
      <Card className="filter-card">
        <div className="filter-row">
          <Select label="Period" value={period} onChange={setPeriod}>
            <option>Last 30 days</option>
            <option>Current quarter</option>
            <option>Current year</option>
          </Select>
          <Select label="Status" value={status} onChange={setStatus}>
            <option value="">All validation statuses</option>
            {appStatuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Select label="Category" value="" onChange={() => {}}>
            <option value="">All categories</option>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Select label="Officer" value="" onChange={() => {}}>
            <option value="">All officers</option>
            {officers.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Button variant="ghost" onClick={() => setStatus("")}>
            Reset Filters
          </Button>
        </div>
      </Card>
      <div className="report-meta">
        <span>Generated {generated}</span>
      </div>
      <div className="dashboard-grid">
        <Card>
          <h2>Application validation summary</h2>
          <Donut
            value={Math.round(
              (filtered.filter((a) => a.status === "Completed").length /
                Math.max(filtered.length, 1)) *
                100,
            )}
            label="complete"
          />
        </Card>
        <Card>
          <h2>Documents verified vs pending</h2>
          <MiniBars
            values={[
              documents.filter((d) => d.status === "Verified").length,
              documents.filter((d) => d.status === "Pending Verification")
                .length,
              documents.filter((d) => d.status === "Expired").length,
            ]}
            labels={["Verified", "Pending", "Expired"]}
            color="teal"
          />
        </Card>
        <Card>
          <h2>Deficiencies by category</h2>
          <MiniBars
            values={[18, 14, 9, 5]}
            labels={["Missing", "Expired", "Mismatch", "Incomplete"]}
          />
        </Card>
        <Card>
          <h2>Manual review workload</h2>
          <Donut value={34} label="resolved" />
        </Card>
        <Card className="span-2">
          <h2>Processing time overview</h2>
          <div className="processing-bars">
            {[
              ["Completeness check", 1.2, 36],
              ["Document review", 2.8, 70],
              ["Compliance review", 3.4, 85],
              ["Official review", 4.1, 100],
            ].map(([x, v, w]) => (
              <div key={x as string}>
                <span>{x as string}</span>
                <div>
                  <i style={{ width: `${w}%` }} />
                </div>
                <b>{v as number} days</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="table-card">
        <div className="card-head">
          <div>
            <h2>Application-wise findings</h2>
            <p>{filtered.length} applications in current report</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Institution</th>
                <th>Category</th>
                <th>Progress</th>
                <th>Open findings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id}>
                  <td>
                    <b>{a.id}</b>
                  </td>
                  <td>{a.institution}</td>
                  <td>{a.category}</td>
                  <td>
                    <Progress value={a.progress} />
                  </td>
                  <td>{i % 4}</td>
                  <td>
                    <Badge value={a.status} />
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => go("applications", a.id)}
                    >
                      View Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function AuditTrail({
  audit,
  notify,
}: {
  audit: AuditEvent[]
  notify: (s: string) => void
}) {
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [action, setAction] = useState("")
  const [selected, setSelected] = useState<AuditEvent | null>(null)
  const visible = audit.filter(
    (a) =>
      (!search ||
        Object.values(a)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!role || a.role === role) &&
      (!action || a.action === action),
  )
  return (
    <>
      <PageHeader
        title="Audit Trail"
        subtitle="Track validation operations, review actions and changes to rules."
      >
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={() => notify("Audit view refreshed")}
        >
          Refresh
        </Button>
        <Button
          icon={Download}
          onClick={() => downloadCsv("audit-log.csv", visible)}
        >
          Export Audit Log
        </Button>
      </PageHeader>
      <Card className="filter-card">
        <div className="filter-row">
          <div className="search-input">
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Application ID, user or detail..."
            />
          </div>
          <Select label="Role" value={role} onChange={setRole}>
            <option value="">All user roles</option>
            <option>Administrator</option>
            <option>Regulatory Officer</option>
          </Select>
          <Select label="Action" value={action} onChange={setAction}>
            <option value="">All action types</option>
            {[...new Set(audit.map((a) => a.action))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Button
            variant="ghost"
            icon={X}
            onClick={() => {
              setSearch("")
              setRole("")
              setAction("")
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>
      <Card className="table-card">
        <div className="table-meta">
          <div>
            <h2>Traceable activity log</h2>
            <p>{visible.length} activity events</p>
          </div>
          <span className="secure-label">
            <ShieldCheck /> Local audit record
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Application / Document</th>
                <th>Details</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id} onClick={() => setSelected(a)}>
                  <td>{a.time}</td>
                  <td>
                    <b>{a.user}</b>
                  </td>
                  <td>{a.role}</td>
                  <td>{a.action}</td>
                  <td>
                    <b className="link">{a.target}</b>
                  </td>
                  <td>{a.detail}</td>
                  <td>
                    <Badge value={a.result} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">Event {selected.id}</span>
                <h2>Audit event detail</h2>
              </div>
              <IconButton label="Close" onClick={() => setSelected(null)}>
                <X />
              </IconButton>
            </div>
            <div className="audit-detail">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k}>
                  <span>{k.replace(/([A-Z])/g, " $1")}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function Rules({
  rules,
  setRules,
  notify,
  resetRules,
}: {
  rules: Rule[]
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>
  notify: (s: string) => void
  resetRules: () => void
}) {
  const [category, setCategory] = useState(categories[0])
  const [edit, setEdit] = useState<Rule | null>(null)
  const [confirm, setConfirm] = useState<Rule | null>(null)
  const scoped = rules.filter(
    (r) => r.category === category || r.category === "All categories",
  )
  const save = (rule: Rule) => {
    setRules((rs) =>
      rs.some((r) => r.id === rule.id)
        ? rs.map((r) => (r.id === rule.id ? rule : r))
        : [...rs, rule],
    )
    setEdit(null)
    notify("Checklist requirement saved")
  }
  return (
    <>
      <PageHeader
        title="Rules & Checklists"
        subtitle="Manage application-category-specific requirements."
      >
        <Button
          variant="secondary"
          onClick={() => {
            setRules((rs) => [
              ...rs,
              ...scoped.map((r) => ({
                ...r,
                id: `${r.id}-COPY`,
                category: `${category}`,
              })),
            ])
            notify("Checklist duplicated")
          }}
        >
          Duplicate Checklist
        </Button>
        <Button
          onClick={() =>
            notify("Checklist changes are already persisted locally")
          }
        >
          Save Changes
        </Button>
      </PageHeader>
      <div className="rules-layout">
        <Card className="category-list">
          <h2>Application categories</h2>
          {categories.map((c) => (
            <button
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
              key={c}
            >
              <span>
                <ListChecks />
              </span>
              {c}
              <ChevronRight />
            </button>
          ))}
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={() => {
              resetRules()
              notify("Rule configuration reset")
            }}
          >
            Reset Configuration
          </Button>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <span className="eyebrow">Checklist editor</span>
              <h2>{category}</h2>
              <p>{scoped.length} applicable requirements</p>
            </div>
            <Button
              icon={Plus}
              onClick={() =>
                setEdit({
                  id: `RULE-${Date.now()}`,
                  name: "",
                  category,
                  evidence: docNames[0],
                  enabled: true,
                  severity: "Medium",
                  updated: "2025-04-26",
                  source: "",
                })
              }
            >
              Add Requirement
            </Button>
          </div>
          <div className="requirement-list">
            {scoped.map((r) => (
              <div key={r.id}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) =>
                      setRules((rs) =>
                        rs.map((x) =>
                          x.id === r.id
                            ? { ...x, enabled: e.target.checked }
                            : x,
                        ),
                      )
                    }
                  />
                  <span />
                </label>
                <div>
                  <b>{r.name}</b>
                  <small>
                    {r.evidence} · {r.source}
                  </small>
                </div>
                <Badge value={r.severity} />
                <IconButton label="Edit requirement" onClick={() => setEdit(r)}>
                  <Settings size={17} />
                </IconButton>
                <IconButton
                  label="Delete requirement"
                  onClick={() => setConfirm(r)}
                >
                  <X size={17} />
                </IconButton>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {edit && (
        <Modal
          title={edit.name ? "Edit Requirement" : "Add Requirement"}
          onClose={() => setEdit(null)}
          wide
        >
          <div className="modal-grid">
            <div className="form-field span-2">
              <label>Requirement *</label>
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                placeholder="Describe the configurable check"
              />
            </div>
            <div className="form-field">
              <label>Applicable document type</label>
              <select
                value={edit.evidence}
                onChange={(e) => setEdit({ ...edit, evidence: e.target.value })}
              >
                {docNames.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Severity</label>
              <select
                value={edit.severity}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    severity: e.target.value as Rule["severity"],
                  })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="form-field span-2">
              <label>Rule source / reference</label>
              <input
                value={edit.source}
                onChange={(e) => setEdit({ ...edit, source: e.target.value })}
              />
            </div>
            <label className="toggle-row">
              <input type="checkbox" defaultChecked />
              <span />
              <div>
                <b>Expiry validation</b>
                <small>Check date validity when applicable</small>
              </div>
            </label>
            <label className="toggle-row">
              <input type="checkbox" defaultChecked />
              <span />
              <div>
                <b>Cross-document comparison</b>
                <small>Compare shared institution identifiers</small>
              </div>
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button disabled={!edit.name.trim()} onClick={() => save(edit)}>
              Save requirement
            </Button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal title="Delete Requirement?" onClose={() => setConfirm(null)}>
          <p className="body-copy">
            Remove <b>{confirm.name}</b> from the checklist?
            This does not affect any official system.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setRules((rs) => rs.filter((r) => r.id !== confirm.id))
                setConfirm(null)
                notify("Requirement deleted")
              }}
            >
              Delete requirement
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function SettingsPage({
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  reset,
  apps,
  notify,
}: {
  theme: string
  setTheme: (s: string) => void
  collapsed: boolean
  setCollapsed: (b: boolean) => void
  reset: () => void
  apps: Application[]
  notify: (s: string) => void
}) {
  const [section, setSection] = useState("Appearance")
  const [resetModal, setResetModal] = useState(false)
  const [name, setName] = useState("Anita Rao")
  const [email, setEmail] = useState("anita.rao@example.com")
  const sections = [
    "Appearance",
    "User Profile",
    "Data Management",
    "Notifications",
    "Security & Access",
    "About",
  ]
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure AICTE VerifyAI."
      />
      <div className="settings-layout">
        <Card className="settings-nav">
          {sections.map((x) => (
            <button
              className={section === x ? "active" : ""}
              onClick={() => setSection(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </Card>
        <Card className="settings-panel">
          {section === "Appearance" && (
            <>
              <h2>Appearance</h2>
              <p>
                Choose a readable interface theme and navigation preference.
              </p>
              <div className="theme-options">
                {["light", "dark", "system"].map((x) => (
                  <button
                    className={theme === x ? "active" : ""}
                    onClick={() => setTheme(x)}
                    key={x}
                  >
                    <div className={`theme-preview ${x}`}>
                      <span />
                      <i />
                      <b />
                    </div>
                    <strong>{x[0].toUpperCase() + x.slice(1)} theme</strong>
                    {theme === x && <CheckCircle2 />}
                  </button>
                ))}
              </div>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={collapsed}
                  onChange={(e) => setCollapsed(e.target.checked)}
                />
                <span />
                <div>
                  <b>Collapsed sidebar</b>
                  <small>Use compact icon-only navigation on desktop</small>
                </div>
              </label>
            </>
          )}
          {section === "User Profile" && (
            <>
              <h2>User Profile</h2>
              <p>Profile information is stored in this browser.</p>
              <div className="profile-edit">
                <div className="avatar-large">AR</div>
                <div className="modal-grid">
                  <div className="form-field">
                    <label>Display name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Role</label>
                    <input value="Regulatory Officer" disabled />
                  </div>
                  <div className="form-field">
                    <label>Department</label>
                    <input value="Regulation Bureau" disabled />
                  </div>
                </div>
              </div>
              <Button onClick={() => notify("Profile changes saved")}>
                Save Changes
              </Button>
            </>
          )}
          {section === "Data Management" && (
            <>
              <h2>Data Management</h2>
              <p>
                Manage application and document records.
              </p>
              <div className="settings-actions">
                <div>
                  <span>
                    <Archive />
                  </span>
                  <div>
                    <b>Load Records</b>
                    <small>
                      Restore the default records across all workspaces.
                    </small>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Load Records
                  </Button>
                </div>
                <div>
                  <span>
                    <Download />
                  </span>
                  <div>
                    <b>Export Current Data</b>
                    <small>
                      Download the current application state as CSV.
                    </small>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => downloadCsv("aicte-records.csv", apps)}
                  >
                    Export Data
                  </Button>
                </div>
                <div>
                  <span className="danger">
                    <RefreshCw />
                  </span>
                  <div>
                    <b>Reset Data</b>
                    <small>
                      Discard changes and restore the original state.
                    </small>
                  </div>
                  <Button variant="danger" onClick={() => setResetModal(true)}>
                    Reset Data
                  </Button>
                </div>
              </div>
            </>
          )}
          {section === "Notifications" && (
            <>
              <h2>Notification Preferences</h2>
              <p>Control in-app alerts.</p>
              {[
                "Missing document alerts",
                "Expiry alerts",
                "Verification status alerts",
                "Review queue alerts",
              ].map((x, i) => (
                <label className="toggle-row setting-toggle" key={x}>
                  <input type="checkbox" defaultChecked={i !== 2} />
                  <span />
                  <div>
                    <b>{x}</b>
                    <small>
                      Display in-app notifications for this event type.
                    </small>
                  </div>
                </label>
              ))}
            </>
          )}
          {section === "Security & Access" && (
            <>
              <h2>Security & Access</h2>
              <div className="notice">
                <Info />
                <span>
                  Role descriptions are for reference. No server-side
                  access control is implemented.
                </span>
              </div>
              <div className="roles">
                {[
                  [
                    "Administrator",
                    "Manage configuration, users and records.",
                  ],
                  [
                    "Regulatory Officer",
                    "Review applications, findings and compliance outcomes.",
                  ],
                  [
                    "Document Reviewer",
                    "Inspect and update document verification records.",
                  ],
                  [
                    "Read-Only Auditor",
                    "View reports and audit events without editing.",
                  ],
                ].map(([r, d]) => (
                  <div key={r}>
                    <span>
                      <Users />
                    </span>
                    <div>
                      <b>{r}</b>
                      <p>{d}</p>
                    </div>
                    <Badge value="Role" />
                  </div>
                ))}
              </div>
            </>
          )}
          {section === "About" && (
            <>
              <div className="about-mark">
                <Building2 />
              </div>
              <h2>AICTE VerifyAI</h2>
              <p>
                AI-powered application validation, document authentication and
                regulatory compliance verification platform.
              </p>
              <div className="about-grid">
                {[
                  ["Problem Statement", "26261"],
                  ["Version", "1.0"],
                ].map(([x, v]) => (
                  <div key={x}>
                    <span>{x}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
      {resetModal && (
        <Modal
          title="Reset all data?"
          onClose={() => setResetModal(false)}
        >
          <p className="body-copy">
            This will discard application, document, rule, review, and audit
            changes stored in this browser.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setResetModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                reset()
                setResetModal(false)
              }}
            >
              Reset Data
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
