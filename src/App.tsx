import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, AppWindow, BarChart3, BriefcaseBusiness, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleDollarSign, Code2, Home, LoaderCircle, Plus,
  SearchCheck, ShieldCheck, X,
} from 'lucide-react';
import {
  Area, CartesianGrid, ComposedChart, LabelList, Line, ReferenceLine, ResponsiveContainer,
  Tooltip as ChartTooltip, XAxis, YAxis,
} from 'recharts';
import { BEST_SCENARIO, CheckStatus, findScenario, Funding, Opening, POLICY_MIN, SCENARIOS, Scenario } from './data/model';
import { exactMoney, money, openingShort } from './lib/format';

type Overlay = 'add-check' | 'expert' | 'rules' | null;

type AppContextValue = {
  opening: Opening;
  funding: Funding;
  scenario: Scenario;
  setOption: (opening: Opening, funding: Funding) => void;
  taxTask: boolean;
  createTaxTask: () => void;
  coverwise: boolean;
  addCoverwise: () => void;
  expertRequested: boolean;
  expertReceived: boolean;
  requestExpert: () => void;
  overlay: Overlay;
  setOverlay: (overlay: Overlay) => void;
  toast: string;
  showToast: (message: string) => void;
  decisionCreated: boolean;
  markDecisionCreated: () => void;
  changing: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);
const useApp = () => useContext(AppContext)!;

function AppProvider({ children }: { children: React.ReactNode }) {
  const [opening, setOpening] = useState<Opening>('Nov 2026');
  const [funding, setFunding] = useState<Funding>('Cash');
  const [taxTask, setTaxTask] = useState(false);
  const [coverwise, setCoverwise] = useState(false);
  const [expertRequested, setExpertRequested] = useState(false);
  const [expertReceived, setExpertReceived] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState('');
  const [decisionCreated, setDecisionCreated] = useState(false);
  const [changing, setChanging] = useState(false);
  const scenario = useMemo(() => findScenario(opening, funding), [opening, funding]);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  };
  const setOption = (nextOpening: Opening, nextFunding: Funding) => {
    if (nextOpening === opening && nextFunding === funding) return;
    setOpening(nextOpening);
    setFunding(nextFunding);
    setChanging(true);
    window.setTimeout(() => setChanging(false), 320);
  };
  const createTaxTask = () => {
    setTaxTask(true);
    showToast('Sales tax task created');
  };
  const addCoverwise = () => {
    setOverlay(null);
    setCoverwise(true);
    showToast('CoverWise added');
  };
  const requestExpert = () => {
    setExpertRequested(true);
    window.setTimeout(() => {
      setExpertReceived(true);
      showToast('Expert review received');
    }, 3000);
  };
  return <AppContext.Provider value={{
    opening, funding, scenario, setOption, taxTask, createTaxTask, coverwise, addCoverwise,
    expertRequested, expertReceived, requestExpert, overlay, setOverlay, toast, showToast,
    decisionCreated, markDecisionCreated: () => setDecisionCreated(true), changing,
  }}>{children}</AppContext.Provider>;
}

type CheckItem = {
  id: string;
  name: string;
  runBy: string;
  status: CheckStatus;
  finding: string;
  details: string;
  sources: Array<{ app: string; used: string; updated: string }>;
};

function financingFinding(scenario: Scenario) {
  if (scenario.opening === 'Nov 2026' && scenario.funding === 'Cash') return 'A $500K line of credit would keep cash above your minimum. Interest through Sep 2027: $42.5K.';
  if (scenario.opening === 'Nov 2026') return 'The line of credit covers the November low point. Interest through Sep 2027: $42.5K.';
  if (scenario.funding === 'Line of credit') return `You don't need to borrow for this plan. The line of credit adds ${money(scenario.interest)} in interest.`;
  return 'No borrowing needed. Cash stays above your minimum.';
}

function financingStatus(scenario: Scenario): CheckStatus {
  if (scenario.opening === 'Nov 2026') return scenario.funding === 'Cash' ? 'caution' : 'pass';
  return scenario.funding === 'Line of credit' ? 'caution' : 'pass';
}

function buildChecks(scenario: Scenario, taxTask: boolean, coverwise: boolean): CheckItem[] {
  const due: Record<Opening, string> = { 'Nov 2026': 'Oct 15, 2026', 'Jan 2027': 'Dec 14, 2026', 'Mar 2027': 'Feb 15, 2027' };
  const common: CheckItem[] = [
    {
      id: 'cash', name: 'Cash floor', runBy: 'Finance agent (Intuit)', status: scenario.cashCheck,
      finding: scenario.cashCheck === 'fail'
        ? `Cash falls to ${money(scenario.lowest)} in ${scenario.lowestMonth}, below your $1.5M minimum.`
        : `Lowest cash is ${money(scenario.lowest)} in ${scenario.lowestMonth}, above your $1.5M minimum.`,
      details: 'Includes $1.12M of bills already scheduled for October and November, mostly holiday inventory.',
      sources: [
        { app: 'Banking', used: '3 accounts, $2.94M on Sep 30', updated: 'Updated 2 min ago' },
        { app: 'Expenses & Bills', used: 'Scheduled bills', updated: 'Updated 3 min ago' },
        { app: 'Accounting', used: "6 stores' first-year results", updated: 'Updated 4 min ago' },
      ],
    },
    {
      id: 'financing', name: 'Financing', runBy: 'Finance agent (Intuit)', status: financingStatus(scenario),
      finding: financingFinding(scenario),
      details: 'Compares the current plan with cash funding and a $500K line of credit at 8.5% APR.',
      sources: [
        { app: 'Banking', used: 'Cash balances and credit availability', updated: 'Updated 2 min ago' },
        { app: 'Accounting', used: 'Forecast inputs', updated: 'Updated 4 min ago' },
      ],
    },
    {
      id: 'demand', name: 'Local demand', runBy: 'Customer agent (Intuit)', status: 'pass',
      finding: '6,240 online orders from the Austin area in the last 12 months, $1.08M in sales.',
      details: 'Austin is your third-largest online market. 34% of those customers bought more than once.',
      sources: [
        { app: 'Shopify', used: 'Orders by shipping ZIP code', updated: 'Updated 6 min ago' },
        { app: 'Accounting', used: 'Sales totals', updated: 'Updated 4 min ago' },
      ],
    },
    {
      id: 'staffing', name: 'Staffing cost', runBy: 'Payroll agent (Intuit)', status: 'pass',
      finding: '12 hires add $57.6K a month in payroll costs, in line with your other stores.',
      details: "Texas has no state income tax. You'll need a Texas Workforce Commission account for unemployment tax before the first payroll. Payroll agent can set this up after you approve.",
      sources: [{ app: 'Payroll', used: "6 stores' staffing", updated: 'Updated 5 min ago' }],
    },
    {
      id: 'tax', name: 'Sales tax', runBy: 'Sales Tax agent (Intuit)', status: taxTask ? 'pass' : 'caution',
      finding: taxTask
        ? `Task created: apply for a Texas sales tax permit. Owner: Maya Chen. Due ${due[scenario.opening]}.`
        : 'A Texas store means collecting Texas sales tax. You need a Texas sales tax permit before your first sale.',
      details: 'Texas requires a permit before taxable sales begin. The task is timed to the selected opening month.',
      sources: [{ app: 'Sales tax settings', used: '5 states registered, Texas not yet', updated: 'Updated 8 min ago' }],
    },
    {
      id: 'lease', name: 'Lease benchmark', runBy: 'SiteLens (partner app)', status: 'caution',
      finding: 'Asking rent of $36K a month is 11% above the median of 6 comparable retail leases within 2 miles ($32.4K).',
      details: 'Comparable leases signed in the last 18 months, 8,000 to 12,000 sq ft. Negotiating to the median saves $43K a year.',
      sources: [
        { app: 'SiteLens', used: 'Commercial lease records', updated: 'Updated 7 min ago' },
        { app: 'Lease draft', used: 'Uploaded Sep 18', updated: 'Updated 4 days ago' },
      ],
    },
  ];
  if (coverwise) common.push({
    id: 'insurance', name: 'Insurance', runBy: 'CoverWise (partner app)', status: 'pass',
    finding: 'Estimated general liability and property coverage: $1,150 a month, from 3 carriers.',
    details: 'The estimate uses the Austin location, square footage, and planned headcount.',
    sources: [{ app: 'CoverWise', used: 'Carrier quotes', updated: 'Updated just now' }],
  });
  return common;
}

function getVerdict(checks: CheckItem[]) {
  const failed = checks.find(check => check.status === 'fail');
  if (failed) return { status: 'fail' as CheckStatus, title: 'Not yet', lines: [failed.finding] };
  const conditions = checks.filter(check => check.status === 'caution').map(check => {
    if (check.id === 'tax') return 'Get a Texas sales tax permit';
    if (check.id === 'lease') return 'Negotiate rent toward $32.4K a month';
    if (check.id === 'financing') return check.finding.startsWith('A $500K') ? 'Use the line of credit' : 'Drop the line of credit';
    return check.finding;
  });
  if (conditions.length) return { status: 'caution' as CheckStatus, title: 'Go, with conditions', lines: conditions };
  return { status: 'pass' as CheckStatus, title: 'Go', lines: ['All checks passed.'] };
}

function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand">Intuit Enterprise Suite</div><span className="top-divider" /><div className="company">Northstar Commerce Group</div>
      <div className="topbar-spacer" /><span className="tag neutral">Prototype</span><span className="avatar">MC</span><div className="user"><b>Maya Chen</b><span>CFO</span></div>
    </header>
    <aside className="rail" aria-label="Primary navigation">
      <div className="rail-items">
        <RailItem icon={<Home />} label="Home" disabled />
        <RailItem icon={<BriefcaseBusiness />} label="Feed" disabled />
        <RailItem icon={<SearchCheck />} label="Preflight" to="/preflight" active={location.pathname.startsWith('/preflight')} />
        <RailItem icon={<BarChart3 />} label="Reports" disabled />
        <RailItem icon={<AppWindow />} label="All apps" disabled />
      </div>
      <RailItem icon={<Code2 />} label="Developers" to="/developers" active={location.pathname.startsWith('/developers')} />
    </aside>
    <main className="main">{children}</main>
    <GlobalOverlays />
  </div>;
}

function RailItem({ icon, label, to, active, disabled }: { icon: React.ReactNode; label: string; to?: string; active?: boolean; disabled?: boolean }) {
  const content = <>{icon}<span className="tooltip">{disabled ? 'Not included in this prototype' : label}</span></>;
  return to ? <Link to={to} className={`rail-item ${active ? 'active' : ''}`} aria-label={label}>{content}</Link>
    : <span className="rail-item disabled" aria-disabled="true" aria-label={label}>{content}</span>;
}

function Button({ children, variant = 'secondary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'text' }) {
  return <button className={`button ${variant} ${className}`} {...props}>{children}</button>;
}

function Status({ status, children }: { status: CheckStatus; children?: React.ReactNode }) {
  return <span className={`status ${status}`}>{status === 'pass' ? <CheckCircle2 /> : <AlertTriangle />}{children ?? status}</span>;
}

function DecisionsHome() {
  const navigate = useNavigate();
  const { decisionCreated, scenario, taxTask } = useApp();
  const [question, setQuestion] = useState('Can we open a store in Austin in November? The landlord wants $36K a month.');
  const [unsupported, setUnsupported] = useState(false);
  const austin = question.toLowerCase().includes('austin');
  const submit = () => austin ? navigate('/preflight/new') : setUnsupported(true);
  const currentVerdict = getVerdict(buildChecks(scenario, taxTask, false));
  return <div className="page home-page">
    <div className="page-heading"><h1>Preflight</h1><p>Check a big decision before you commit.</p></div>
    <section className="composer card">
      <label htmlFor="decision-question">What are you deciding?</label>
      <textarea id="decision-question" value={question} onChange={event => { setQuestion(event.target.value); setUnsupported(false); }} />
      <div className="examples" aria-label="Example decisions">{['Hire 8 people for the holidays', 'Buy a second delivery van', 'Open a store in Austin'].map(text =>
        <button key={text} onClick={() => { setQuestion(text === 'Open a store in Austin' ? 'Can we open a store in Austin in November? The landlord wants $36K a month.' : text); setUnsupported(false); }}>{text}</button>)}</div>
      {unsupported && <div className="inline-note">This prototype includes the Austin store decision only. <button onClick={() => { setQuestion('Can we open a store in Austin in November? The landlord wants $36K a month.'); setUnsupported(false); }}>Use the Austin example</button></div>}
      <div className="composer-actions"><Button variant="primary" onClick={submit}>Set up decision</Button></div>
    </section>
    <section className="recent"><h2>Recent decisions</h2><div className="list-card">
      {decisionCreated && <Link className="decision-row interactive" to="/preflight/austin"><span><b>Open a store in Austin, TX</b><small>Decided Sep 22</small></span><span className={`tag ${currentVerdict.status}`}>{currentVerdict.title}</span><ChevronRight /></Link>}
      <div className="decision-row"><span><b>Hire 6 warehouse staff for Q4</b><small>Decided Sep 2</small></span><span className="tag pass">Go</span></div>
      <div className="decision-row"><span><b>Buy a second delivery van</b><small>Decided Aug 18</small></span><span className="tag fail">Not yet</span></div>
    </div></section>
  </div>;
}

const PLAN_ROWS = [
  ['Opening month', 'November 2026', 'Your question'], ['Rent', '$36K a month', 'Your question, lease draft'],
  ['Buildout', '$480K, paid the month before opening', 'Contractor estimate, Expenses & Bills'], ['Opening inventory', '$240K', 'Purchasing plan'],
  ['Staff', '12 hires at $4,800 a month each, fully loaded', 'Your 6 stores, Payroll'], ['Sales', '$150K in month 1, rising to $330K a month by month 4', 'First year of your 6 stores, Accounting'],
  ['Gross margin', '52%', 'Your stores, last 12 months, Accounting'], ['Cash minimum', '$1.5M', 'Board policy, set Mar 2026'],
];

function PlanSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const skip = Boolean(location.state && (location.state as { skipWorking?: boolean }).skipWorking);
  const [step, setStep] = useState(skip ? 3 : 0);
  useEffect(() => { if (skip || step >= 3) return; const timer = window.setTimeout(() => setStep(value => value + 1), 500); return () => window.clearTimeout(timer); }, [step, skip]);
  if (step < 3) return <div className="page setup-page"><section className="working-card card" aria-live="polite"><LoaderCircle className="spinner large" /><h1>Building your plan</h1>{['Reading your question', 'Finding results from your 6 stores in Accounting', 'Reading the lease draft uploaded Sep 18'].map((label, index) => <div className={`working-step ${index < step ? 'done' : index === step ? 'active' : ''}`} key={label}>{index < step ? <CheckCircle2 /> : index === step ? <LoaderCircle className="spinner" /> : <span />}{label}</div>)}</section></div>;
  return <div className="page setup-page"><div className="page-heading"><h1>Open a store in Austin, TX</h1><p>Written by Intuit AI from your question and your data. Review before running checks.</p></div><section className="card plan-review"><table><thead><tr><th>Assumption</th><th>Value</th><th>Source</th></tr></thead><tbody>{PLAN_ROWS.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></section><div className="page-actions"><Button onClick={() => navigate('/preflight')}>Back</Button><Button variant="primary" onClick={() => navigate('/preflight/austin')}>Run checks</Button></div></div>;
}

function Workspace() {
  const app = useApp();
  const checks = useMemo(() => buildChecks(app.scenario, app.taxTask, app.coverwise), [app.scenario, app.taxTask, app.coverwise]);
  const verdict = getVerdict(checks);
  const [readyCount, setReadyCount] = useState(() => sessionStorage.getItem('preflightChecksSeen') ? 99 : 0);
  useEffect(() => app.markDecisionCreated(), []);
  useEffect(() => { if (readyCount >= checks.length) { sessionStorage.setItem('preflightChecksSeen', '1'); return; } const timer = window.setTimeout(() => setReadyCount(count => count + 1), 350); return () => window.clearTimeout(timer); }, [readyCount, checks.length]);
  return <div className="workspace-page"><div className="workspace-head"><div className="breadcrumb"><Link to="/preflight">Preflight</Link><span>/</span>Open a store in Austin, TX</div><h1>Open a store in Austin, TX</h1><p>Asked by Dan Ortiz, CEO. Answer due Fri, Sep 25.</p></div><VerdictBanner verdict={verdict} /><div className="workspace-grid"><aside className="plan-column"><PlanCard /></aside><section className="center-column"><CashChart scenario={app.scenario} animate={app.changing} /><MetricTiles scenario={app.scenario} /><CompareOptions /></section><aside className="checks-column"><section className="card checks-card" data-testid="checks-card"><div className="card-heading"><div><h2>Checks</h2><p>{checks.length} checks</p></div><Button onClick={() => app.setOverlay('add-check')}><Plus />Add a check</Button></div><div className="check-list">{checks.map((check, index) => <CheckRow key={check.id} check={check} queued={readyCount <= index} running={readyCount === index || (app.changing && index < 2)} />)}</div></section><ExpertReview /></aside></div><div className="workspace-footer"><Button onClick={() => app.setOverlay('expert')}>Ask an expert</Button><span className="disabled-wrap" title={verdict.status === 'fail' ? 'Resolve failed checks first' : undefined}><Button variant="primary" disabled={verdict.status === 'fail'} onClick={() => window.location.hash = '#/preflight/austin/memo'}>Create decision memo</Button></span></div></div>;
}

function VerdictBanner({ verdict }: { verdict: ReturnType<typeof getVerdict> }) {
  const { setOverlay } = useApp();
  return <section className={`verdict-banner ${verdict.status}`}><div className="verdict-word">{verdict.title}</div><div className="verdict-copy">{verdict.lines.length === 1 ? <p>{verdict.lines[0]}</p> : <ul>{verdict.lines.map(line => <li key={line}>{line}</li>)}</ul>}<div className="verdict-rule">Verdict from Preflight rules: any failed check means not yet. Intuit AI does not decide. <button onClick={() => setOverlay('rules')}>How verdicts work</button></div></div></section>;
}

function PlanCard() {
  const { opening, funding, setOption } = useApp();
  return <section className="card plan-card"><h2>Plan</h2><Segmented label="Opening month" value={opening} options={['Nov 2026', 'Jan 2027', 'Mar 2027']} onChange={value => setOption(value as Opening, funding)} /><Segmented label="Funding" value={funding} options={['Cash', 'Line of credit']} longSecond onChange={value => setOption(opening, value as Funding)} /><Link className="text-link" to="/preflight/new" state={{ skipWorking: true }}>View plan assumptions</Link></section>;
}

function Segmented({ label, value, options, onChange, longSecond }: { label: string; value: string; options: string[]; onChange: (value: string) => void; longSecond?: boolean }) {
  return <fieldset className="segmented-field"><legend>{label}</legend><div className={`segmented ${longSecond ? 'vertical' : ''}`}>{options.map(option => <label key={option} className={option === value ? 'active' : ''}><input type="radio" name={label} value={option} checked={option === value} onChange={() => onChange(option)} /><span>{option}{option === 'Line of credit' && <small>$500K at 8.5%</small>}</span></label>)}</div></fieldset>;
}

function AccessibleDot(props: { cx?: number; cy?: number; payload?: { month: string; scenario: number } }) {
  if (!props.cx || !props.cy || !props.payload) return null;
  return <circle cx={props.cx} cy={props.cy} r="3.5" className="chart-dot" tabIndex={0} role="img" aria-label={`${props.payload.month}, scenario balance ${money(props.payload.scenario)}`} />;
}

function LowestLabel(props: { x?: number; y?: number; value?: number; lowest?: number }) {
  if (props.value == null || props.value !== props.lowest || props.x == null || props.y == null) return null;
  return <g transform={`translate(${props.x - 48},${props.y - 35})`}><rect className="lowest-label-bg" width="96" height="24" rx="4" /><text className="lowest-label" x="48" y="16" textAnchor="middle">Lowest: {money(props.value)}</text></g>;
}

function CashChart({ scenario, animate, compact = false }: { scenario: Scenario; animate?: boolean; compact?: boolean }) {
  const [showBaseline, setShowBaseline] = useState(true);
  return <section className={`card chart-card ${compact ? 'compact' : ''}`} data-testid="cash-chart-card"><div className="card-heading"><div><h2>Cash through Sep 2027</h2><p>Scenario range and month-end balance</p></div>{!compact && <label className="legend-toggle"><input type="checkbox" checked={showBaseline} onChange={event => setShowBaseline(event.target.checked)} /><span className="legend-line baseline" />Without the store</label>}</div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={scenario.chart} margin={{ top: 36, right: 16, bottom: 6, left: 8 }}><CartesianGrid vertical={false} stroke="var(--divider)" /><XAxis dataKey="month" tickFormatter={(value: string) => value.slice(0, 3)} tick={{ fontSize: 12, fill: 'var(--secondary)' }} axisLine={false} tickLine={false} /><YAxis domain={[1_000_000, 3_800_000]} ticks={[1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000, 3_500_000]} tickFormatter={money} tick={{ fontSize: 12, fill: 'var(--secondary)' }} axisLine={false} tickLine={false} width={52} /><ChartTooltip content={({ active, payload, label }) => active && payload?.length ? <div className="chart-tooltip"><b>{label}</b><span>Scenario {money(Number(payload.find(item => item.dataKey === 'scenario')?.value ?? 0))}</span>{showBaseline && <span>Without the store {money(Number(payload.find(item => item.dataKey === 'baseline')?.value ?? 0))}</span>}<span>Range {money(Number((payload[0]?.payload as { low: number }).low))} to {money(Number((payload[0]?.payload as { high: number }).high))}</span></div> : null} /><Area dataKey="range" stroke="none" fill="var(--range-band)" isAnimationActive={animate} animationDuration={300} />{showBaseline && <Line dataKey="baseline" stroke="var(--baseline-line)" strokeDasharray="6 5" dot={false} strokeWidth={2} isAnimationActive={animate} animationDuration={300} />}<ReferenceLine y={POLICY_MIN} stroke="var(--policy-line)" strokeDasharray="6 5" label={{ value: 'Your minimum $1.5M', fill: 'var(--fail)', fontSize: 12, position: 'insideTopRight' }} /><Line dataKey="scenario" stroke="var(--brand-line)" strokeWidth={2.5} dot={<AccessibleDot />} activeDot={{ r: 5 }} isAnimationActive={animate} animationDuration={300}><LabelList dataKey="scenario" content={<LowestLabel lowest={scenario.lowest} />} /></Line></ComposedChart></ResponsiveContainer><table className="sr-only"><caption>Cash forecast data</caption><thead><tr><th>Month</th><th>Scenario</th><th>Without the store</th><th>Range low</th><th>Range high</th></tr></thead><tbody>{scenario.chart.map(point => <tr key={point.month}><th>{point.month}</th><td>{exactMoney(point.scenario)}</td><td>{exactMoney(point.baseline)}</td><td>{exactMoney(point.low)}</td><td>{exactMoney(point.high)}</td></tr>)}</tbody></table></div></section>;
}

function MetricTiles({ scenario }: { scenario: Scenario }) {
  const tiles = [['Lowest cash', money(scenario.lowest), scenario.lowestMonth], ['Store profit by Sep 2027', money(scenario.profit), 'After operating costs'], ['Pays back in', '13 months', 'From opening'], ['Cash on Sep 30, 2027', money(scenario.endCash), scenario.funding === 'Line of credit' ? 'Includes $500K borrowed' : 'No borrowing']];
  return <div className="metric-tiles">{tiles.map(([label, value, caption]) => <div className="metric-tile card" key={label}><span>{label}</span><strong>{value}</strong><small>{caption}</small></div>)}</div>;
}

function CompareOptions({ readOnly = false }: { readOnly?: boolean }) {
  const { scenario, setOption } = useApp();
  const maxProfit = Math.max(...SCENARIOS.map(option => option.profit));
  const select = (option: Scenario) => { if (!readOnly) setOption(option.opening, option.funding); };
  return <section className="card compare-card"><div className="card-heading"><div><h2>Compare options</h2><p>Six ways to time and fund the Austin store</p></div></div><div className="table-scroll"><table><thead><tr><th>Opening</th><th>Funding</th><th>Lowest cash</th><th>Store profit by Sep 2027</th><th>Cash check</th></tr></thead><tbody>{SCENARIOS.map(option => <tr key={option.id} className={`${scenario.id === option.id ? 'selected' : ''} ${readOnly ? '' : 'selectable'}`} tabIndex={readOnly ? undefined : 0} role={readOnly ? undefined : 'button'} aria-label={readOnly ? undefined : `Select ${option.opening}, ${option.funding}`} onClick={() => select(option)} onKeyDown={event => { if (!readOnly && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); select(option); } }}><td>{openingShort(option.opening)}{option.id === BEST_SCENARIO.id && <span className="tag selected-tag">Best option</span>}</td><td>{option.funding}</td><td>{money(option.lowest)}</td><td><span className="profit-value">{money(option.profit)}</span><span className="profit-bar"><i style={{ width: `${option.profit / maxProfit * 100}%` }} /></span></td><td><Status status={option.cashCheck}>{option.cashCheck}</Status></td></tr>)}</tbody></table></div><p className="comparison-note">Best option: open in November with the line of credit. $156K more profit by Sep 2027 than opening in January without borrowing.</p></section>;
}

function CheckRow({ check, queued, running }: { check: CheckItem; queued: boolean; running: boolean }) {
  const { createTaxTask } = useApp(); const [expanded, setExpanded] = useState(false);
  return <div className={`check-row ${running ? 'rerunning' : ''}`}><button className="check-summary" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><span className={`status-icon ${queued ? 'queued' : check.status}`}>{running ? <LoaderCircle className="spinner" /> : queued ? <span /> : check.status === 'pass' ? <Check /> : <AlertTriangle />}</span><span className="check-copy"><span className="check-top"><b>{check.name}</b><em>{queued ? running ? 'Running' : 'Queued' : check.status}</em></span><small>{check.runBy}</small><p>{queued ? 'Waiting to run' : check.finding}</p></span>{expanded ? <ChevronDown /> : <ChevronRight />}</button>{expanded && !queued && <div className="check-details"><p>{check.details}</p><h3>Sources</h3>{check.sources.map(source => <div className="source-row" key={source.app}><span><b>{source.app}</b><small>{source.used}</small></span><em>{source.updated}</em></div>)}{check.id === 'tax' && check.status === 'caution' && <Button variant="primary" onClick={createTaxTask}>Create task</Button>}</div>}</div>;
}

function ExpertReview() {
  const { expertRequested, expertReceived, setOverlay } = useApp();
  return <section className="card expert-card"><h2>Expert review</h2>{expertReceived ? <><div className="reviewer"><span className="avatar small">RC</span><div><b>Rivera & Co. CPAs</b><small>Reviewed 4:10 PM</small></div></div><p>Sign the lease under Northstar Retail LLC, the entity that runs your stores. Plan for Texas franchise tax filings starting next year. The rest of the plan looks sound.</p></> : expertRequested ? <div className="expert-wait"><LoaderCircle className="spinner" /><p>Rivera & Co. CPAs is reviewing the decision.</p></div> : <><p>Get a second opinion before you share this.</p><Button onClick={() => setOverlay('expert')}>Ask an expert</Button></>}</section>;
}

function DecisionMemo() {
  const app = useApp(); const checks = buildChecks(app.scenario, app.taxTask, app.coverwise); const verdict = getVerdict(checks);
  if (verdict.status === 'fail') return <Navigate to="/preflight/austin" replace />;
  const conditions = checks.filter(check => check.status === 'caution');
  const uniqueSources = Array.from(new Set(checks.flatMap(check => check.sources.map(source => source.app))));
  const optionText = `${app.scenario.opening === 'Nov 2026' ? 'open in November 2026' : `open in ${app.scenario.opening}`} ${app.funding === 'Line of credit' ? 'with a $500K line of credit' : 'with cash'}`;
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); } catch { /* local clipboard may be unavailable */ } app.showToast('Link copied'); };
  return <div className="memo-page page"><div className="memo-toolbar"><Link className="text-link" to="/preflight/austin">Back to decision</Link><div><Button onClick={copyLink}>Copy share link</Button><Button variant="primary" onClick={() => window.print()}>Print or save as PDF</Button></div></div><article className="memo-document"><header><h1>Decision memo: Open a store in Austin, TX</h1><p>Prepared for Dan Ortiz, CEO. Sep 22, 2026.</p></header><section className={`recommendation ${verdict.status}`}><span>Recommendation</span><strong>{verdict.title}: {optionText}.</strong></section><section><h2>Why</h2><div className="why-grid"><p>Lowest cash is <b>{money(app.scenario.lowest)}</b> in {app.scenario.lowestMonth}, above the $1.5M minimum.</p><p>Store profit reaches <b>{money(app.scenario.profit)}</b> by Sep 2027. The store pays back in 13 months.</p><p>The recommended option produces <b>$156K more profit</b> than opening in January without borrowing.</p></div></section><CashChart scenario={app.scenario} compact /><CompareOptions readOnly /><section><h2>Conditions</h2>{conditions.length ? <ul>{conditions.map(check => <li key={check.id}>{check.finding}</li>)}</ul> : <p>No open conditions.</p>}</section><section><h2>Checks</h2><div className="memo-checks">{checks.map(check => <div key={check.id}><Status status={check.status} /><span><b>{check.name}</b><small>{check.runBy}</small></span></div>)}</div></section><section><h2>Sources</h2><p>{uniqueSources.join(', ')}</p></section><section className="signoff"><h2>Sign-off</h2><p>Prepared by Maya Chen, CFO</p>{app.expertReceived && <p>Reviewed by Rivera & Co. CPAs, 4:10 PM</p>}</section><p className="memo-caption">Written by Intuit AI from your plan and {checks.length} checks. Numbers come from Preflight's model, not from AI. Review before sharing.</p></article></div>;
}

function Developers() {
  const tabs = ['Discover', 'Build', 'Test', 'Publish', 'Earn'] as const; const [active, setActive] = useState<typeof tabs[number]>('Discover'); const [testState, setTestState] = useState<'idle' | 'running' | 'first' | 'second'>('idle');
  const runTest = () => { const next = testState === 'first' ? 'second' : 'first'; setTestState('running'); window.setTimeout(() => setTestState(next), 1500); };
  return <div className="page developer-page"><div className="page-heading"><h1>Build a Preflight check</h1><p>Bring your data to the decisions IES customers make every day.</p></div><div className="dev-layout"><nav className="dev-tabs" aria-label="Developer steps">{tabs.map(tab => <button key={tab} className={active === tab ? 'active' : ''} aria-current={active === tab ? 'page' : undefined} onClick={() => setActive(tab)}>{tab}</button>)}</nav><section className="card dev-content">{active === 'Discover' && <Discover />}{active === 'Build' && <Build />}{active === 'Test' && <TestPanel state={testState} run={runTest} />}{active === 'Publish' && <Publish />}{active === 'Earn' && <Earn />}</section></div></div>;
}

function Discover() { const rows = [['Lease benchmark', 'Open a location', '1,240'], ['Insurance estimate', 'Open a location', '980'], ['Time to hire', 'Hiring', '760'], ['Equipment financing', 'Large purchase', '540']]; return <><h2>Most requested checks</h2><table><thead><tr><th>Check</th><th>Decision type</th><th>Requests last month</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></>; }
function Build() { return <><h2>Build</h2><p>Define what the check reads, then return a sourced result.</p><div data-testid="dev-build-code"><h3>Manifest</h3><pre><code>{`{ "name": "CoverWise insurance estimate", "decision_types": ["open_location"], "reads": ["location", "square_feet", "headcount"], "writes": [], "price_per_run_usd": 4 }`}</code></pre><h3>Response</h3><pre><code>{`{ "status": "pass", "finding": "Estimated coverage: $1,150 a month, from 3 carriers.", "values": [{ "label": "monthly_premium", "amount": 1150, "source": "carrier_quotes/2026-09-22" }] }`}</code></pre></div><div className="dev-note"><ShieldCheck />Every value must carry a source, or Preflight rejects the response.</div></>; }
function TestPanel({ state, run }: { state: string; run: () => void }) { return <><h2>Test</h2><p>Run the check against representative decisions before publishing.</p>{state === 'idle' && <Button variant="primary" onClick={run}>Run against 50 sample decisions</Button>}{state === 'running' && <div className="test-result"><LoaderCircle className="spinner" />Running against 50 sample decisions</div>}{state === 'first' && <div className="test-result fail-result"><AlertTriangle /><div><b>48 of 50 passed.</b><p>2 failed: a value without a source (samples 17 and 41).</p><Button onClick={run}>Run again</Button></div></div>}{state === 'second' && <div className="test-result pass-result"><CheckCircle2 /><div><b>50 of 50 passed.</b><p>The check is ready for review.</p></div></div>}</>; }
function Publish() { return <><h2>Publish</h2><div className="listing"><span className="partner-mark">CW</span><div><b>CoverWise insurance estimate</b><small>Partner</small><p>Estimated general liability and property coverage from 3 carriers.</p></div><span>$4 per run</span></div><h3>Review checklist</h3><ul className="review-list">{['Every value has a source', 'Reads only what it needs', 'Responds in under 5 seconds', 'Accuracy review by Intuit'].map(item => <li key={item}><CheckCircle2 />{item}</li>)}</ul></>; }
function Earn() { return <><h2>Earn</h2><p className="large-copy">You set a price per run. You keep 80%.</p><div className="earn-example"><CircleDollarSign /><p>CoverWise: $4 per run x 3,100 runs last month = $12,400.<br /><b>Your share: $9,920.</b></p></div></>; }

function DialogFrame({ title, children, footer, panel = false, onClose }: { title: string; children: React.ReactNode; footer?: React.ReactNode; panel?: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null); const returnFocus = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => { const element = root.current!; const focusable = () => Array.from(element.querySelectorAll<HTMLElement>('button, a, input, textarea, [tabindex="0"]')).filter(item => !item.hasAttribute('disabled')); element.querySelector<HTMLElement>('h2')?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); if (event.key === 'Tab') { const items = focusable(); const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }; document.addEventListener('keydown', onKey); return () => { document.removeEventListener('keydown', onKey); returnFocus.current?.focus(); }; }, [onClose]);
  return <div className="scrim" onMouseDown={event => event.target === event.currentTarget && onClose()}><div ref={root} role="dialog" aria-modal="true" aria-labelledby="overlay-title" className={panel ? 'side-panel' : 'modal'}><div className="overlay-head"><h2 id="overlay-title" tabIndex={-1}>{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X /></button></div><div className="overlay-body">{children}</div>{footer && <div className="overlay-footer">{footer}</div>}</div></div>;
}

function GlobalOverlays() { const app = useApp(); if (!app.overlay && !app.toast) return null; return <>{app.overlay === 'add-check' && <AddCheckPanel />}{app.overlay === 'expert' && <ExpertModal />}{app.overlay === 'rules' && <RulesPopover />}{app.toast && <div className="toast" role="status">{app.toast}</div>}</>; }

function AddCheckPanel() { const app = useApp(); return <DialogFrame panel title="Add a check" onClose={() => app.setOverlay(null)} footer={<Link className="text-link" to="/developers" onClick={() => app.setOverlay(null)}>Build a check for Preflight</Link>}><p className="overlay-subtitle">Checks for: opening a location</p><h3>Installed</h3><div className="listing"><span className="partner-mark">SL</span><div><b>SiteLens lease benchmark</b><small>Partner</small><p>Compares asking rent with nearby signed leases.</p></div><Status status="pass">Added</Status></div><h3>Available</h3><div className="listing"><span className="partner-mark">CW</span><div><b>CoverWise insurance estimate</b><small>Partner</small><p>$4 per run</p><em>Reads: location, square footage, headcount. Can't change anything.</em></div>{app.coverwise ? <Status status="pass">Added</Status> : <Button variant="primary" onClick={app.addCoverwise}>Add</Button>}</div></DialogFrame>; }

function ExpertModal() {
  const app = useApp(); const [reviewer, setReviewer] = useState('accountant'); const [include, setInclude] = useState(true); const [note, setNote] = useState(''); const [sent, setSent] = useState(false); const send = () => { app.requestExpert(); setSent(true); };
  return <DialogFrame title="Ask an expert to review this decision" onClose={() => app.setOverlay(null)} footer={sent ? <Button variant="primary" onClick={() => app.setOverlay(null)}>Done</Button> : <><Button onClick={() => app.setOverlay(null)}>Cancel</Button><Button variant="primary" onClick={send}>Send request</Button></>}>{sent ? <div className="confirmation"><CheckCircle2 /><h3>Request sent</h3><p>Rivera & Co. CPAs will review the decision and reply here.</p></div> : <div className="expert-form"><fieldset><legend>Who should review it?</legend><label><input type="radio" name="reviewer" value="accountant" checked={reviewer === 'accountant'} onChange={() => setReviewer('accountant')} /><span><b>Your accountant</b><small>Rivera & Co. CPAs</small></span></label><label><input type="radio" name="reviewer" value="intuit" checked={reviewer === 'intuit'} onChange={() => setReviewer('intuit')} /><span><b>Intuit Experts</b><small>A business tax expert, usually replies within 1 business day</small></span></label></fieldset><label className="checkbox-row"><input type="checkbox" checked={include} onChange={event => setInclude(event.target.checked)} />Include the plan, the chart, and all check results</label><label className="field-label">Add a note (optional)<textarea value={note} onChange={event => setNote(event.target.value)} /></label></div>}</DialogFrame>;
}

function RulesPopover() { const app = useApp(); return <DialogFrame title="How verdicts work" onClose={() => app.setOverlay(null)} footer={<Button variant="primary" onClick={() => app.setOverlay(null)}>Got it</Button>}><ol className="rules-list"><li><Status status="fail">Not yet</Status><p>Any failed check stops the decision.</p></li><li><Status status="caution">Go, with conditions</Status><p>No failures, with one or more cautions to resolve.</p></li><li><Status status="pass">Go</Status><p>Every check passes.</p></li></ol><p className="overlay-subtitle">Intuit AI prepares the plan and writes the memo. The rules produce the verdict.</p></DialogFrame>; }

function NotFound() { return <div className="page"><h1>We couldn't find that page</h1><p><Link className="text-link" to="/preflight">Back to Preflight</Link></p></div>; }

export default function App() {
  return <AppProvider><Shell><Routes><Route path="/" element={<Navigate to="/preflight" replace />} /><Route path="/preflight" element={<DecisionsHome />} /><Route path="/preflight/new" element={<PlanSetup />} /><Route path="/preflight/austin" element={<Workspace />} /><Route path="/preflight/austin/memo" element={<DecisionMemo />} /><Route path="/developers" element={<Developers />} /><Route path="*" element={<NotFound />} /></Routes></Shell></AppProvider>;
}
