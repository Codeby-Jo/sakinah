import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface JourneyItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  routePrefix: string;
}

interface JourneySection {
  title: string;
  items: JourneyItem[];
}

const JOURNEY_SECTIONS: JourneySection[] = [
  {
    title: 'A · ARRIVAL',
    items: [
      { id: 'arrival-home', badge: 'S', title: 'Raya welcomes', subtitle: 'First face of the app · the hero moment', routePrefix: '/sakinah' },
      { id: 'arrival-role', badge: 'R', title: 'Who are you here as', subtitle: 'Seeker or wali · sets the driver', routePrefix: '/sakinah/role' },
      { id: 'arrival-primer', badge: 'P', title: 'What to expect', subtitle: 'Disarm the fear before asking', routePrefix: '/sakinah/primer' },
      { id: 'arrival-kyc', badge: 'K', title: 'Verify · KYC', subtitle: 'Layered trust at the door', routePrefix: '/sakinah/kyc' },
      { id: 'arrival-liveness', badge: 'L', title: 'Liveness check', subtitle: 'The anti-catfish gate', routePrefix: '/sakinah/liveness' },
    ]
  },
  {
    title: 'B · THE BUILDING',
    items: [
      { id: 'building-overview', badge: 'O', title: 'Journey overview', subtitle: 'Matchmaking is the spine', routePrefix: '/sakinah/home' },
    ]
  },
  {
    title: 'C · BECOMING READY',
    items: [
      { id: 'ready-niyyah', badge: 'N', title: 'Niyyah · intention', subtitle: 'Why, before who', routePrefix: '/sakinah/niyyah' },
      { id: 'ready-values', badge: 'V', title: 'What you bring + maslak', subtitle: 'Values & find-your-own tradition', routePrefix: '/sakinah/values' },
      { id: 'ready-mirror', badge: 'M', title: 'The Mirror', subtitle: 'Character through the 9 topics', routePrefix: '/sakinah/mirror' },
      { id: 'ready-portrait', badge: 'P', title: 'Your portrait', subtitle: 'Soft derived signals', routePrefix: '/sakinah/portrait' },
    ]
  },
  {
    title: 'D · MATCHING',
    items: [
      { id: 'matching-pool', badge: 'C', title: 'Considered few', subtitle: 'Abundance calmed, no feed', routePrefix: '/sakinah/considered-few' },
      { id: 'matching-candidate', badge: 'R', title: 'A resonance', subtitle: 'Character first, never a face', routePrefix: '/sakinah/candidate' },
      { id: 'matching-matchflow', badge: 'F', title: 'Match flow', subtitle: 'A structured opening', routePrefix: '/sakinah/matchflow' },
      { id: 'matching-conversation', badge: 'C', title: 'Communication', subtitle: 'Topic by topic, with family', routePrefix: '/sakinah/conversation' },
      { id: 'matching-decision', badge: 'D', title: 'The decision', subtitle: 'People decide, not the algorithm', routePrefix: '/sakinah/decision' },
    ]
  },
  {
    title: 'SUPPORT & SAFETY',
    items: [
      { id: 'support-safety', badge: 'S', title: 'Safety & privacy', subtitle: 'Defend the insider threat', routePrefix: '/sakinah/safety' },
      { id: 'support-community', badge: 'C', title: 'Community', subtitle: 'Belonging, never a leaderboard', routePrefix: '/sakinah/community' },
      { id: 'support-vent', badge: 'V', title: 'Vent Box', subtitle: 'The scaffolding, never the door', routePrefix: '/sakinah/vent' },
    ]
  }
];

export const SakinahJourneyNavigator: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
    if (onClose) onClose();
  };

  const isActive = (item: JourneyItem) => {
    if (item.routePrefix === '/sakinah') {
      return location.pathname === '/sakinah' || location.pathname === '/sakinah/';
    }
    return location.pathname.startsWith(item.routePrefix);
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#070a10] sm:bg-transparent overflow-y-auto custom-scrollbar">
      <div className="p-6 sm:p-0 flex-1 flex flex-col gap-8 pb-24 sm:pb-8">
        
        {JOURNEY_SECTIONS.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <h3 className="text-[10px] tracking-[0.15em] font-medium text-[#c8a153] uppercase px-3">
              {section.title}
            </h3>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.routePrefix === '/sakinah/candidate' ? '/sakinah/candidate/mock_candidate_1' : 
                                                item.routePrefix === '/sakinah/matchflow' ? '/sakinah/matchflow/mock_matchflow_1' :
                                                item.routePrefix === '/sakinah/conversation' ? '/sakinah/conversation/mock_conversation_1' :
                                                item.routePrefix === '/sakinah/decision' ? '/sakinah/decision/mock_matchflow_1' :
                                                item.routePrefix)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-300 group ${
                      active ? 'bg-[rgba(200,161,83,0.1)] border border-[rgba(200,161,83,0.2)]' : 'hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
                    }`}
                  >
                    <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold mt-0.5 transition-colors ${
                      active ? 'bg-[#c8a153] text-[#070a10]' : 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] group-hover:bg-[rgba(255,255,255,0.1)] group-hover:text-[rgba(255,255,255,0.7)]'
                    }`}>
                      {item.badge}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-medium transition-colors ${active ? 'text-[#c8a153]' : 'text-[rgba(255,255,255,0.8)] group-hover:text-white'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[rgba(255,255,255,0.4)] mt-0.5 leading-snug">
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-8 pt-8 border-t border-[rgba(255,255,255,0.05)] px-3">
          <h3 className="text-[10px] tracking-[0.15em] font-medium text-[rgba(255,255,255,0.3)] uppercase mb-4">
            Anchoring Principles
          </h3>
          <ul className="flex flex-col gap-4">
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Matchmaking is the spine.</strong>
              Wellbeing is scaffolding; community is soil. Never lead with the scaffolding.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Character before a face.</strong>
              No swipe, no feed, no public profiles, no photo-first.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Find-your-own maslak.</strong>
              The app takes no doctrinal stance; nobody is told they were filtered out for who they are.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">No riya engine.</strong>
              Worship and gathering never feed matching or a public score.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Women-first safety.</strong>
              Defend the authorized insider, not just the outsider.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Intimacy after nikah.</strong>
              Never a pre-nikah chat topic.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Raya everywhere; consent always with the seeker.</strong>
              A wali may steward, never decide.
            </li>
            <li className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              <strong className="text-[rgba(255,255,255,0.8)] font-medium block mb-0.5">Honesty over a bad match.</strong>
              Cadence flexes with density. Launch concentrated.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
