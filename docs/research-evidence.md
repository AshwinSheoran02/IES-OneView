# Preflight research evidence and prompt record

Preflight is an AI-native decision-check layer for Intuit Enterprise Suite (IES). It brings Intuit agents, specialist partner checks, deterministic financial models, and human reviewers into one decision workspace so a CFO can reach a sourced, defensible verdict.

This document records the evidence, Intuit Design for Delight (D4D) artifacts, assumptions, experiments, and AI-assisted workflow behind the prototype and case-study deck.

## Research scope and limitations

- The work was completed as a time-boxed case exercise.
- No live customer interviews were completed. The customer framing is a research-backed hypothesis built from public surveys, IES product material, the case brief, and finance-workflow patterns.
- The Austin company, partner apps, transactions, prices, and operating data in the prototype are synthetic.
- Survey statistics are externally sourced. Scenario outputs come from the deterministic cash model used by both the Python reference and TypeScript prototype.
- Pricing, partner revenue share, adoption targets, and experiment thresholds are hypotheses to test, not validated commercial commitments.

## 1. Deep Customer Empathy

### Customer problem statement

| Prompt | Working statement |
| --- | --- |
| I am | The CFO of a 420-person retailer. The CEO asks me before every big move. |
| I am trying to | Give a confident yes or no on a major decision, such as opening a store, within days. |
| But | The answer requires five or more systems, a spreadsheet forecast, and expertise I may not have. |
| Because | Data, forecasts, and specialist knowledge sit apart, and nothing ties them to the decision. |
| Which makes me feel | Exposed. I either slow the business down or rely on judgment without enough evidence. |

Developers have a related problem: partners with deep specialist data, such as lease benchmarks or insurance quotes, cannot easily reach the CFO's decision workflow or earn from a reusable check.

### Evidence behind the problem

| Evidence | Product implication | Source |
| --- | --- | --- |
| 57% of surveyed finance leaders missed a time-sensitive strategic action because financial visibility arrived too late. | The experience should compress a multi-day evidence-gathering process into one decision workspace. | [Intuit Future of Finance 2026](https://erp.intuit.com/blog/guide/future-of-finance-2026-report/) |
| 51% of the finance week goes to manual work such as reconciliation, exports, error fixing, and report stitching. | Agents should collect and structure evidence, while people retain decision authority. | [Intuit Future of Finance 2026](https://erp.intuit.com/blog/guide/future-of-finance-2026-report/) |
| 70% lack one reliable view of critical business data; only 14% had same-day data for their most recent major decision. | Preflight should assemble a decision-specific view rather than add another general dashboard. | [Intuit Future of Finance 2026](https://erp.intuit.com/blog/guide/future-of-finance-2026-report/) |
| 71% would reject a 99%-accurate AI system if it lacked a reasoning trace. | Every number needs a source, rules must be readable, and AI should explain rather than set the verdict. | [Sage / IDC research on explainable AI in finance](https://www.sage.com/en-us/news/press-releases/2026/07/finance-leaders-demand-ai-transparency-as-71-percent-reject-unexplained-decisions/) |
| IES is positioned as a connected mid-market platform spanning financial management, business intelligence, payments, payroll, HR, and marketing. | IES has the breadth to orchestrate cross-functional decision checks and the distribution to support a partner ecosystem. | [Intuit IES product announcement, May 2026](https://investors.intuit.com/_assets/_afd6ba507aaf806b1cfa2eeb74ad890f/intuit/news/2026-05-13_Intuit_Unlocks_New_Phase_of_Growth_for_Mid_Market__1311.pdf) |

The Intuit survey was commissioned by Intuit and fielded by CatalystMR in May 2026 among 2,000 CFOs, controllers, and VPs of Finance at US businesses with at least $2.5 million in annual revenue. The Sage finding comes from an IDC survey of 2,275 senior finance decision-makers and influencers conducted in February 2026.

### Ideal state

> In a perfect world, every big decision gets a clear, sourced go or no-go in an afternoon, checked by every expert I would want.

The intended benefit is confidence in every financial decision: the CFO gets speed without giving up traceability, control, or human judgment.

## 2. Go Broad to Go Narrow

Intuit describes D4D as three principles: Deep Customer Empathy, Go Broad to Go Narrow, and Rapid Experimentation. Going broad explores multiple possible solutions; going narrow focuses on the ideas most likely to deliver meaningful customer benefit. See Intuit's [D4D overview](https://www.intuit.com/company/corporate-responsibility/job-readiness/design-for-delight/) and [narrowing guide](https://www.intuit.com/blog/life-at-intuit/design-for-delight-narrowing-on-bold-solutions-to-delight-customers/).

### Seven ideas generated

1. Cross-app change feed
2. AI close agent
3. AI CFO chat
4. Multi-country compliance board
5. Agent-hiring marketplace
6. Money map of cash flows
7. Preflight: decision checks by agents, partners, and experts

The first concept explored was a cross-app change feed. It was rejected after comparison with peer work because it resembled a generic reporting experience and did not create a sufficiently distinct decision outcome.

### 2x2 narrowing

The ideas were plotted against:

- Vertical axis: expected customer benefit
- Horizontal axis: need for a capability beyond what IES already offers

| Idea | New-capability score | Customer-benefit score | Interpretation |
| --- | ---: | ---: | --- |
| 1. Cross-app change feed | 3.5 | 6.2 | Useful, but close to existing reporting and insight patterns |
| 2. AI close agent | 1.2 | 6.2 | Valuable, but IES already has close and finance-agent momentum |
| 3. AI CFO chat | 2.2 | 4.2 | Familiar interaction with limited differentiation |
| 4. Multi-country compliance board | 7.2 | 3.8 | New capability, narrower benefit for this case |
| 5. Agent-hiring marketplace | 8.6 | 6.6 | Strong ecosystem opportunity, but one step removed from the CFO outcome |
| 6. Money map of cash flows | 5.8 | 2.6 | Helpful visualization, limited end-to-end decision value |
| 7. Preflight | 8.0 | 8.8 | Highest combined customer benefit and differentiated capability |

Ideas 5 and 7 occupied the top-right area and moved to the next narrowing step.

### 100-point narrowing

The 100 points were allocated using one criterion: **which idea best solves the customer problem of reaching a fast, defensible decision?**

| Idea | Points |
| --- | ---: |
| Preflight | 45 |
| Agent-hiring marketplace | 20 |
| Cross-app change feed | 20 |
| Multi-country compliance board | 10 |
| Money map of cash flows | 5 |

Preflight won because it directly delivers the customer outcome while creating a place for agents, partner capabilities, and experts to participate. The marketplace remains an enabling layer inside the concept rather than the primary customer proposition.

## 3. Solution principles

1. **Decision-first:** begin with the question, not another dashboard.
2. **Rules decide:** deterministic models and readable rules calculate the verdict; generative AI prepares and explains the evidence.
3. **Experts on call:** a CFO can request a CPA or Intuit Expert review with the full decision context.
4. **Open to partners:** partner checks add specialist data that IES should not build alone.
5. **Source or reject:** every returned value carries a source; an unsourced response fails validation.
6. **Human authority:** the CFO makes the decision. Automation can act only after approval.

## 4. Prototype scenario and model evidence

The prototype tests one decision: **Can Northstar Commerce Group open an Austin store in November 2026?** The user can compare November, January, and March opening dates with cash funding or a $500K line of credit.

Key deterministic inputs include:

- Starting cash: $2.94M
- Minimum cash policy: $1.5M
- Store build-out: $480K before opening
- Opening inventory: $240K
- Monthly rent: $36K
- Monthly insurance: $11K
- Monthly payroll: $57.6K
- Line of credit: $500K at 8.5% APR
- First three months of base sales ramp: $150K, $230K, $290K, followed by $330K

Reference outputs:

| Scenario | Lowest cash | Cash check | Profit through Sep 2027 | Interest | Ending cash |
| --- | ---: | --- | ---: | ---: | ---: |
| Nov 2026, cash | $1.353M in Nov 2026 | Fail | $566,060 | $0 | $2,946,060 |
| Nov 2026, line of credit | $1.846M in Nov 2026 | Pass | $523,556 | $42,504 | $3,403,556 |
| Jan 2027, cash | $2.120M in Nov 2026 | Pass | $367,060 | $0 | $2,747,060 |
| Mar 2027, cash | $2.120M in Nov 2026 | Pass | $266,600 | $0 | $2,646,600 |

The default verdict is **Not yet** because the November cash-funded plan falls below the $1.5M policy minimum. With the line of credit, the cash check passes, allowing a conditional go after the remaining cautions are addressed.

The prototype also demonstrates sourced checks for financing, local demand, staffing cost, sales tax, lease benchmarking, and an optional partner-provided insurance check.

## 5. Rapid Experimentation and leaps of faith

Intuit recommends behavioral experiments that close the gap between what customers say and what they do. Common D4D formats include concierge, fake-o, sketch, technical, and fully built A/B tests. See Intuit's [rapid experimentation guide](https://www.intuit.com/blog/life-at-intuit/rapid-experimentation-to-deliver-customer-benefits/).

### Leap-of-faith assumptions

| ID | Assumption | Crucial | Unproven | First test | Pass condition |
| --- | --- | ---: | ---: | --- | --- |
| A | CFOs will bring major decisions into IES | High | High | Concierge: run Preflight manually for 10 real decisions | 7 of 10 use the resulting memo |
| B | CFOs will act on a rules-based verdict | High | High | Fake-o: analysts run the checks behind the interface with 15 CFOs | 60% act without rebuilding the analysis |
| C | Partners will build checks for revenue share | High | High | Fake-o door: show a “Build a check” journey in 15 partner calls | 5 letters of intent |
| D | CPAs will review a decision within a day at a viable price | High | Medium | Concierge review with ProAdvisor firms | Response-time and price threshold confirmed |
| E | The cash model is accurate enough for decisions | High | Lower | Back-test against completed expansion decisions | Forecast error within the agreed policy band |
| F | CFOs want a shareable decision memo | Lower | Lower | Prototype test with a memo-sharing action | Repeated sharing with CEO or board stakeholders |

The recommended roadmap starts with three decision types and 20 design-partner customers, adds a check API beta with 10 partners and paid CPA reviews, and only later allows approved agents to complete actions such as sales-tax registration or payroll setup.

## 6. Business-model hypotheses

These figures are intentionally marked for validation:

- Three decisions per month included with IES
- Preflight Pro at $250 per company per month
- Expert reviews at $150 to $300, shared with CPA firms
- Partner checks retain 80% of each run; Intuit retains 20%
- Credit offers appear only after a verdict and never influence the verdict

## 7. Prompt and AI-use record

### Research and D4D framing prompt

The research prompt asked the model to synthesize the case brief, Intuit's 2026 mid-market evidence, public IES product releases, and D4D guidance; write a customer problem statement and ideal state; generate seven materially different concepts; narrow them using a customer-benefit versus new-capability 2x2 and a 100-point allocation; and identify leap-of-faith assumptions with fast behavioral tests.

### Prototype build prompt

The prototype prompt asked for a working IES-style React experience with:

- A decision workspace for opening an Austin store
- Six deterministic scenarios across opening date and funding choice
- A cash chart with a $1.5M policy line and an explicit lowest point
- Expandable sourced checks and rule-based verdicts
- A decision memo and expert-review flow
- A developer journey for discovering, building, testing, publishing, and monetizing partner checks
- Accessibility, responsive behavior, deterministic fixtures, and automated interaction checks

### Deck prompt

The final deck prompt required exactly eight slides covering customer empathy, seven ideas, 2x2 narrowing, 100-point narrowing, the product and operating model, partner platform and business model, leap-of-faith experiments, metrics, risks, and a transparent AI-process record. It also required fresh element-level screenshots and programmatic validation of fonts, links, notes, and evidence-image scale.

### Background-image prompt

Built-in image generation was asked for three minimal, white, 16:9 corporate-fintech backgrounds using Intuit blue and cyan light orbs with fine ripple outlines. The cover variant reserved the entire left content area and placed the visual only on the right edge; content variants placed a small visual in either the top-right or bottom-right corner. The prompt prohibited text, logos, icons, people, screenshots, borders, and dark backgrounds.

### Division of work and verification

- **Claude:** research synthesis, D4D framing, seven-idea exploration, narrowing structure, early cash-model logic, and implementation specifications.
- **Codex:** application implementation, deterministic fixtures, screenshot capture, PowerPoint generation, link wiring, visual QA, and deck validation.
- **Human judgment:** selected the concept, reviewed positioning and trade-offs, and retained decision authority.
- **Checks performed:** Python and TypeScript used equivalent deterministic model logic; the app build passed; Playwright captured fresh UI evidence; the final deck was rendered to PDF and inspected slide by slide.

## 8. What should be researched next

1. Interview 8 to 12 mid-market CFOs about the last high-stakes decision they delayed or rebuilt manually.
2. Observe which sources they gather, whom they call, how they set guardrails, and what makes a recommendation defensible.
3. Run the concierge and fake-o tests for assumptions A and B before expanding the product surface.
4. Interview specialist-data partners and ProAdvisor firms to validate check economics, permission boundaries, liability, and review turnaround.
5. Back-test the model against real completed decisions and define acceptable error bands with finance leaders.

---

Prototype: [Open Preflight](https://ashwinsheoran02.github.io/IES-OneView/)

Prepared for the Intuit Enterprise Suite case study by Ashwin Sheoran, B26375.
