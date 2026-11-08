import React, { useEffect } from 'react';
import { ui, on } from './engine/engine.js';
import { useEngine } from './ui/hooks.js';
import { Overlays, toast } from './ui/overlays.jsx';
import Home from './features/home/Home.jsx';
import Start from './features/start/Start.jsx';
import Play from './features/play/Play.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Projects from './features/pages/Projects.jsx';
import Lessons from './features/lessons/Lessons.jsx';
import ConsultView from './features/consult/ConsultView.jsx';
import Admin from './features/admin/Admin.jsx';
import IntakeOverlay from './features/intake/IntakeOverlay.jsx';
import ScanOverlay from './features/scan/ScanOverlay.jsx';
import AIChat from './features/ai/AIChat.jsx';
import AnnounceBar from './features/start/AnnounceBar.jsx';
import { openPlans } from './features/plans/PlansModal.jsx';

const VIEWS = { home: Home, start: Start, play: Play, dash: Dashboard, projects: Projects, lessons: Lessons, consult: ConsultView, admin: Admin };

export default function App() {
  useEngine();
  useEffect(() => {
    const a = on('toast', (m, k, o) => toast(m, k, o));
    const b = on('openPlans', (r) => openPlans(r));
    return () => { a(); b(); };
  }, []);
  const View = VIEWS[ui.view] || Home;
  return (
    <div id="app" dir="rtl" lang="ar">
      <AnnounceBar />
      <View />
      <IntakeOverlay />
      <ScanOverlay />
      <AIChat />
      <Overlays />
    </div>
  );
}
