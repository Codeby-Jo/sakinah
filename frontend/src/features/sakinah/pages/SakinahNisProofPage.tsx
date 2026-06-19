import React, { useEffect, useState } from 'react';
import { SakinahJourneyFrame } from '../components/SakinahJourneyFrame';
import { SakinahCard } from '../components/SakinahCard';
import { SakinahNotice } from '../components/SakinahNotice';
import { DevFallbackBadge } from '../components/DevFallbackBadge';
import { getNisProofReport } from '../services/sakinahApi';

interface ProofResult {
  candidate_id: string;
  expected: string;
  actual: string;
  reason: string;
}

interface ProofReport {
  current_user: string;
  nis_passed: boolean;
  results: ProofResult[];
}

const humanLabels: Record<string, string> = {
  'demo_candidate_strong': 'Strong Candidate',
  'demo_candidate_banned': 'Banned Candidate',
  'demo_candidate_angry': 'Angry / Weak Repair Candidate',
  'demo_candidate_age_mismatch': 'Age Mismatch Candidate',
  'demo_candidate_weak': 'Weak Compatibility Candidate',
  'demo_candidate_insufficient': 'Insufficient Data Candidate',
};

export const SakinahNisProofPage: React.FC = () => {
  const [report, setReport] = useState<ProofReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProof() {
      try {
        const data = await getNisProofReport();
        setReport(data);
      } catch (err: any) {
        if (err.message && (err.message.includes('Forbidden') || err.message.includes('403') || err.message.includes('404'))) {
          setError('Proof report is disabled outside development mode.');
        } else {
          setError('Failed to connect to the NIS backend engine. Please ensure the backend is running.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProof();
  }, []);

  const getBadgeColor = (expected: string, actual: string) => {
    if (expected !== actual) return 'var(--sakinah-error, #f44336)';
    if (actual === 'SHOWN') return 'var(--sakinah-success, #4CAF50)';
    return 'var(--sakinah-gold, #CFA870)';
  };

  return (
    <SakinahJourneyFrame>
      <div className="flex flex-col gap-8 pb-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light tracking-tight text-[#F5E8C7]">NIS Practical Proof Report</h1>
          <p className="text-[#8D8673]">A controlled backend demonstration showing how NIS accepts or blocks candidates.</p>
        </div>

        <div className="mb-6">
          <DevFallbackBadge message="Development Proof Mode: This page is for internal demo/testing only and must not be exposed in production." />
        </div>

        {loading && (
          <SakinahCard className="flex items-center justify-center min-h-[120px]">
            <p className="text-[#8D8673]">Executing NIS Proof Engine...</p>
          </SakinahCard>
        )}

        {error && (
          <SakinahNotice 
            icon="⚠️" 
            title="Production Safety Active" 
            message={error} 
          />
        )}

        {report && (
          <div className="flex flex-col gap-8">
            
            <SakinahCard glow>
              <h2 className="text-xl text-[#F5E8C7] mb-6 font-medium">Proof Status</h2>
              <div className="flex flex-col gap-4 text-[#8D8673]">
                <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.05)]">
                  <span>Current demo user:</span>
                  <span className="text-[#F5E8C7]">{report.current_user}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.05)]">
                  <span>NIS proof status:</span>
                  <span style={{ color: report.nis_passed ? '#4CAF50' : '#f44336', fontWeight: 600 }}>
                    {report.nis_passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.05)]">
                  <span>Backend authority:</span>
                  <span className="text-[#F5E8C7]">Enabled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Frontend decision-making:</span>
                  <span className="text-[#F5E8C7]">Disabled</span>
                </div>
              </div>
            </SakinahCard>

            <div>
              <h3 className="text-[#D4A853] mb-4 text-lg font-medium">Candidate Outcomes</h3>
              <div className="flex flex-col gap-4">
                {report.results.map((r, idx) => (
                  <SakinahCard key={idx}>
                    <h4 className="text-[#F5E8C7] text-lg mb-4">{humanLabels[r.candidate_id] || r.candidate_id}</h4>
                    <div className="flex gap-4 mb-4 flex-wrap">
                      <div className="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.03)] border text-sm font-medium"
                           style={{ borderColor: getBadgeColor(r.expected, r.actual), color: getBadgeColor(r.expected, r.actual) }}>
                        Expected: {r.expected}
                      </div>
                      <div className="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.03)] border text-sm font-medium"
                           style={{ borderColor: getBadgeColor(r.expected, r.actual), color: getBadgeColor(r.expected, r.actual) }}>
                        Actual: {r.actual}
                      </div>
                    </div>
                    <div className="text-[#8D8673] text-sm leading-relaxed">
                      <strong className="text-[#D4A853]">Reason:</strong> {r.reason}
                    </div>
                  </SakinahCard>
                ))}
              </div>
            </div>

            <SakinahCard>
              <h2 className="text-[#F5E8C7] text-lg mb-4 font-medium">How this proves NIS is working</h2>
              <ol className="list-decimal pl-5 space-y-2 text-[#8D8673]">
                <li>NIS receives multiple controlled candidates.</li>
                <li>It does not show everyone.</li>
                <li>It applies hard filters first.</li>
                <li>It checks psychological pair dynamics.</li>
                <li>It applies confidence/no-match rules.</li>
                <li>It only allows candidates that pass.</li>
                <li>The frontend only displays backend-approved results.</li>
              </ol>
            </SakinahCard>

            <SakinahNotice 
              icon="🔒"
              title="Privacy Proof" 
              message="No Aadhaar, No selfie, No raw Raya conversation, No raw Barakah entries, No compatibility percentage, No spiritual score, No perfect match claim."
            />

          </div>
        )}
      </div>
    </SakinahJourneyFrame>
  );
};
