# Brand Map → React port: architecture & contracts

We are porting a working vanilla-JS single-page app ("براند ماب", Arabic RTL board game for brand strategy) to React 18 + Vite.
Original sources (read-only reference): `/tmp/claude-0/-home-user/b01b648a-443d-5981-8dad-373cf38f9549/scratchpad/build/`
(`shell.html` = page markup incl. landing + overlay containers, `style.css`, and the JS modules `ui.js dash.js pages.js digital.js physical.js lessons.js board2d.js agents.js consult.js aichat.js admin.js admin2.js admin3.js`).
React project root: `/tmp/claude-0/-home-user/b01b648a-443d-5981-8dad-373cf38f9549/scratchpad/react/` (below, paths are relative to it).

## Golden rules
1. **Visual parity**: `src/styles/app.css` is the original `style.css` unchanged. Reproduce the original markup structure and class names exactly so the CSS applies (e.g. `<section id="v-play">`, `.hud`, `.qcard`, `.pn`, `.kp`, `.btn pri`). Same Arabic copy, same icons, same behaviour.
2. **Real React, no string templates**: convert template-string HTML into JSX components. No `innerHTML`/`data-act` event delegation. Use `onClick`/`onChange` props, component state (`useState`) for local UI state, and the engine for shared state. The only allowed `dangerouslySetInnerHTML` is via `<Art html>` for trusted SVG art strings generated in-project (lesson figures, card art from `art.js` engine functions like `face()`), and `<Icon>`.
3. **Import explicitly**. Every identifier must be imported. Run the checker on your folder until it is clean:
   `node scripts/check.mjs src/features/<yourfolder>` (it flags syntax errors, names not exported by the target module, and undefined identifiers). "missing file … pending" is OK only for files owned by another agent per the contracts below.
4. Do **not** edit files you do not own: `src/engine/*`, `src/ui/*`, `src/App.jsx`, `src/nav.js`, `src/main.jsx`, `src/styles/*`, other agents' folders. If you need a helper that is missing, write it in your own folder. Report engine problems in your final message instead of editing the engine.
5. Do **not** run `npm run build`/`vite build` (other agents are working concurrently). The checker is your gate.
6. Keep the original Arabic texts verbatim. Code comments may be Arabic or English, brief.

## The engine: `src/engine/engine.js`
Framework-agnostic logic generated from the originals (data, cms layer, art, core session store, consultants/admin/biz logic, audio `SND`, 3D `Board`). Full export list: `ENGINE_EXPORTS.txt`. Import what you need:
```js
import { S, CODE, ME, PROFILE, IS_ADMIN, IS_OWNER, LOCAL, RO, CAP, ui, setUI, patch, logEv, notify, emit, on, Q, ALLQ, STAGES, N_Q, plist, fget, confOf, ... } from '../../engine/engine.js';
```
- `S` (current session doc), `CODE`, `PROFILE`, `IS_ADMIN`… are **live bindings**: always current when read, but read-only for importers. Change state only through engine functions (`patch(p,{silent,now})`, `openSession`, `createSession`, `afterOpen`, `saveProfile`, `setUI`, …). `setVar(name,value)` exists for tests only.
- `ui` is the shared UI-state object the original code used (`ui.view`, `ui.q`, `ui.boardMode`, `ui.sel`, `ui.dtab`, …). Read it directly; write with `setUI({...})` (re-renders everything). Prefer component `useState` for purely local UI state.
- Re-rendering: call `useEngine()` (from `src/ui/hooks.js`) at the top of every component that reads engine state. Every `patch`, remote snapshot, `setUI`, profile change bumps a version that re-renders subscribers.
- Engine functions that used to `toast()` now call `notify()`; App shows them as toasts. `emit('openPlans', reason)` opens the customer plans modal.
- HTML-string helpers still exist in the engine (`esc`, `icon`) — do not use them for rendering; use JSX + `<Icon>`.
- 3D board: `Board.init()`, `Board.mount(el, mode)` ('hero' | 'play'), `Board.sync(stateOrDEMO,{animate})`, `Board.focus(qid,{instant})`, `Board.overview()`, `Board.finale()`, `Board.onPick = qid => …`, `Board.setTimer`, `Board.redraw()`. Mount it in a `useEffect` on a ref'd container.
- Sound: `SND.play(id)`, `SND.startTrack`, `SND.stopTrack`, `SND.P`, `SND.FX`, `SND.TRACKS`, `SND.cur()`, `SND.apply()`, `SND.save()`, `SND.preview(id)`.

## Shared UI kit (`src/ui/`)
- `Icon.jsx`: `<Icon name="handshake" cls="" />`, `<Art html={svgString} as="span" className="" />`.
- `overlays.jsx`: `openModal(<X/>, {wide})`, `closeModal()`, `openDrawer(<X/>, {wide})`, `closeDrawer()`, `toast(msg, kind, {sticky, actions:[{t,fn}]})`, `<DrawerHead title={…}>{extra buttons}</DrawerHead>` (renders `.dh` with close button). Modal content should use the original inner structure: `<h3>…</h3><div className="mb">…</div><div className="mf">…buttons…</div>`. Pass a component element (e.g. `openModal(<ExpertModal/>)`) so it keeps its own hooks/state and re-renders with the engine.
- `Panel.jsx`: `<Panel title={<><Icon name="activity"/> عنوان</>} sub="…" act={<button…/>} cls="span7">…</Panel>` = original `pnl(...)`.
- `LinesEditor.jsx`: `<LinesEditor value={text} onChange={v=>…} min={6} placeholder="…" disabled={RO}/>` = original `linesEd` (one line per idea).
- `util.js`: `copyText(text,msg)`, `debounced(key,fn,ms)`, `patchLater(key, patchObj, ms)` (silent debounced patch — use for typing into session fields; also mutate nothing locally, keep a local `useState` for the input value).
- `hooks.js`: `useEngine()`.
- Navigation `src/nav.js`: `go(view, extraUiState?)` (sets hash + view; play/dash fall back to start when no session), `show(view, extra)`, `setHash(h)`, `route()`. Views: `home start play dash projects lessons consult admin`.

## Module contracts (who owns what, exact exports)
Paths under `src/features/`. Each owner must provide **exactly these exports** (more is fine). Others import them even before they exist.

| Owner | File | Exports |
|---|---|---|
| A start | `home/Home.jsx` | `default Home` (view `#v-home`, landing + hero 3D board with `DEMO`) |
| A | `start/Start.jsx` | `default Start` (view `#v-start`: account bar, registration, new/join/photo tabs, created screen, my/team sessions) |
| A | `start/AnnounceBar.jsx` | `default AnnounceBar` (CMS announcement bar) |
| A | `plans/PlansModal.jsx` | `openPlans(reason?)` (customer plans + subscription request modal) |
| B play | `play/Play.jsx` | `default Play` (view `#v-play`) |
| B | `play/actions.js` | `goQ(qid)`, `finishSession(force=false)`, `openReview()`, `openSound()` |
| B | `play/QuestionCard.jsx` | `QuestionCard({q})` (= original `qCardHTML(q)` card face), `CardTop({q,a})` (= `cardTop`), `AnswerCardFace({q,a})` (static answer card face, used by lessons/admin previews) |
| B | `play/ReceivingBoard.jsx` | `default ReceivingBoard` (2D board, original board2d.js) |
| C intake+scan | `intake/IntakeOverlay.jsx` | `default IntakeOverlay` (global, renders nothing when closed), `openIntake(step=1)`, `closeIntake()`, `requireCompletion(onDone)` → `true` if project card + digital presence are complete; otherwise opens the intake at the missing step and calls `onDone()` after the user finishes it, returns `false` |
| C | `scan/ScanOverlay.jsx` | `default ScanOverlay` (global), `openScan()`, `closeScan()` |
| C | `scan/ScanBanner.jsx` | `default ScanBanner` (status strip above the 2D board; renders null when not relevant) |
| D dashboard | `dashboard/Dashboard.jsx` | `default Dashboard` (view `#v-dash`), `openCardD(qid)` |
| D | `dashboard/logic.js` | all non-render functions/consts of `dash.js` under their original names (`CADS STS follows axFollows cad axLast axDue axHealth overall nextReview daysTo riskList optKey plan PEST IMP MOVE_T RISK_L SUG_IND dcf threatAll threatLbl indReadings momentum lastChange histCount isNew` …) |
| D | `dashboard/Mcard.jsx` | `Mcard({q})` (= original `mcard(q)`) |
| D | `docs/export.js` | `docModel() docHTML(B) buildDocx(B) saveFile(name,data,type) dlDocx() dlHtml() dlJson() openDownload()` |
| E pages | `pages/logic.js` | `pageFeeds pageState allTasks taskStats pagesApproved pageBlocks pageDocModel pageNotes loadProjects projMetrics` (original names/semantics from `pages.js`) |
| E | `pages/PagesTab.jsx`, `pages/TracksTab.jsx`, `pages/ProjSwitch.jsx` | `default` component each (= `dPages`, `dTracks`, `projSwitch`) |
| E | `pages/Projects.jsx` | `default Projects` (view `#v-projects`) |
| E | `digital/DigitalTab.jsx` | `default DigitalTab` (= `dDigital`) |
| E | `digital/logic.js` | `digitalBlocks() platReadings() chkItems()` (+ others from the dashboard half of `digital.js`) |
| F learn+ai+consult | `lessons/Lessons.jsx` | `default Lessons` (view `#v-lessons`) |
| F | `lessons/LessonDrawer.jsx` | `openLesson(id)` (id = card id like `'1_3'` or special lesson id like `'gold'`, `'physical'`) |
| F | `lessons/figures.js` | `figFor(q)`, `figSpecial(k)` (SVG strings) |
| F | `agents/AgentPanel.jsx` | `AgentPanel({qid, small})`, `AgentScoreChip({qid})`, `runAgent(qid,{quiet})`, `runPageAgents(n)`, `agentRuns(qid)`, `VERD`, `agentName(q)` |
| F | `ai/AIChat.jsx` | `default AIChat` (global FAB + side panel), `openAIChat()` |
| F | `consult/ExpertModal.jsx` | `openExpert()` (3-step booking with a real consultant) |
| F | `consult/ConsultView.jsx` | `default ConsultView` (view `#v-consult`, consultant dashboard) |
| F | `consult/ConsAdmin.jsx` | `ConsAdmin({tab})` (inline admin: list/add/bookings), `openConsAdmin(tab)` (same in a drawer) |
| G admin | `admin/Admin.jsx` | `default Admin` (view `#v-admin`, all 12 sections) |

Cross-calls you may rely on: `openIntake`, `openScan`, `openExpert`, `openLesson`, `openAIChat`, `openPlans`, `openCardD`, `openDownload`, `go`, `goQ`, `finishSession`, `QuestionCard`, `CardTop`, `AnswerCardFace`, `AgentPanel`, `AgentScoreChip`, `runPageAgents`, `ConsAdmin`, `Mcard`.

## Global overlays
`App.jsx` always renders `<IntakeOverlay/> <ScanOverlay/> <AIChat/> <Overlays/>`; each decides its own visibility from `ui` flags its owner defines (e.g. `ui.ikOpen`, `ui.scanOpen`, `ui.aiOpen`) via `setUI`. Original overlay containers (`#ikx`, `#scanx`, `#aiPanel`, `#aiFab`) markup/classes are in `shell.html`/the JS sources.

## View lifecycle
Original `show(v)` side effects now live in each view's `useEffect` (e.g. Play: `enforceCall()`, mount/sync/focus the 3D board, apply `ui.boardMode`; Home: `Board.mount(heroEl,'hero'); Board.sync(DEMO)`; Dashboard: mark seen on unmount). Keep `document.body.dataset.view` handled by `nav.js`.
