import { useState } from 'react';
import { Themes } from './design/system';
import { Shell } from './design/Shell';
import {
  MgrDashboard,
  MgrModels,
  MgrPolicies,
  MgrEditor,
  MgrViolations,
  MgrViolationDetail,
  MgrRag,
  MgrRagDetail,
  MgrAnalytics,
  MgrDeptReport,
  MgrWorkflow
} from './design/manager-screens';
import {
  CfoSpend,
  CfoAnalysis,
  CfoRoi,
  CfoForecast,
  CfoBudgets,
  CfoReports
} from './design/cfo-screens';
import {
  UserGallery,
  UserBuilder,
  UserTools,
  UserKnowledge
} from './design/user-screens';

const PERSONA_DEFAULT = {
  manager: 'm-dashboard',
  cfo: 'c-spend',
  user: 'u-gallery'
};

function App() {
  const [theme] = useState('navy');
  const [persona, setPersonaState] = useState('manager');
  const [current, setCurrent] = useState(PERSONA_DEFAULT[persona]);

  const t = Themes[theme as keyof typeof Themes] || Themes.navy;

  const setPersona = (p: any) => {
    setPersonaState(p);
    if ((PERSONA_DEFAULT as any)[p]) {
      setCurrent((PERSONA_DEFAULT as any)[p]);
    }
  };

  const go = (id: any) => {
    setCurrent(id);
  };

  let screen = null;
  if (persona === 'manager') {
    screen = ({
      'm-dashboard': <MgrDashboard t={t} go={go} />,
      'm-models': <MgrModels t={t} go={go} />,
      'm-policies': <MgrPolicies t={t} go={go} />,
      'm-editor': <MgrEditor t={t} go={go} />,
      'm-violations': <MgrViolations t={t} go={go} />,
      'm-violation-detail': <MgrViolationDetail t={t} go={go} />,
      'm-rag': <MgrRag t={t} go={go} />,
      'm-rag-detail': <MgrRagDetail t={t} go={go} />,
      'm-analytics': <MgrAnalytics t={t} go={go} />,
      'm-dept-report': <MgrDeptReport t={t} go={go} />,
      'm-workflow': <MgrWorkflow t={t} go={go} />,
    })[current] || <MgrDashboard t={t} go={go} />;
  } else if (persona === 'cfo') {
    screen = ({
      'c-spend': <CfoSpend t={t} go={go} />,
      'c-analysis': <CfoAnalysis t={t} go={go} />,
      'c-roi': <CfoRoi t={t} go={go} />,
      'c-forecast': <CfoForecast t={t} go={go} />,
      'c-budgets': <CfoBudgets t={t} go={go} />,
      'c-reports': <CfoReports t={t} go={go} />,
    })[current] || <CfoSpend t={t} go={go} />;
  } else {
    screen = ({
      'u-gallery': <UserGallery t={t} go={go} />,
      'u-mine':    <UserTools t={t} go={go} />,
      'u-rag':     <UserKnowledge t={t} go={go} />,
      'u-builder': <UserBuilder t={t} go={go} />,
      'u-skills':  <UserGallery t={t} go={go} />, // Redirecting to gallery for now
    })[current] || <UserGallery t={t} go={go} />;
  }

  return (
    <Shell t={t} persona={persona} setPersona={setPersona} current={current} setCurrent={go}>
      {screen}
    </Shell>
  );
}

export default App;
