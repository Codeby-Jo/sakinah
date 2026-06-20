import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMirror, updateMirror } from '../services/sakinahApi';
import { 
  SakinahJourneyFrame, 
  SakinahReflectionCard
} from '../components';

const DIMENSIONS = [
  { id: 'family', name: 'Parents & Family', question: 'When you picture a hard week, where does your gratitude land first?', optA: 'Find peace in calling your parents — their voice steadies you', optB: 'Find peace in solitude first, then reach out once settled' },
  { id: 'work', name: 'Work & Provision', question: 'How do you view ambition in your home?', optA: 'I want us to actively push each other to achieve more', optB: 'I prefer to leave the hustle outside and keep home a sanctuary' },
  { id: 'friends', name: 'Friends & Circle', question: 'How much space do your friends take in your weekend?', optA: 'My door is always open, the more the merrier', optB: 'I prefer quiet weekends with just family and one or two close friends' },
  { id: 'habits', name: 'Bad Habits', question: 'When a habit needs breaking, what is your approach?', optA: 'Cold turkey — I need to rip the bandaid off', optB: 'Slowly easing out — I need grace to make lasting change' },
  { id: 'looks', name: 'Looks & Self-image', question: 'How much does presentation matter on a regular day?', optA: 'I like to dress well even at home, it affects my mood', optB: 'Comfort first — at home, I am completely relaxed' },
  { id: 'responsibility', name: 'Responsibility', question: 'When a sudden problem arises, what is your first instinct?', optA: 'Take charge immediately and assign next steps', optB: 'Pause, assess quietly, and consult before acting' },
  { id: 'expectations', name: 'Expectations', question: 'What feels heavier to you?', optA: 'Failing to meet my own high standards', optB: 'Disappointing someone who relied on me' },
  { id: 'finances', name: 'Shared Finances', question: 'How do you prefer to manage household spending?', optA: 'Everything pooled together, total transparency', optB: 'Shared basics, but with private autonomy for the rest' },
  { id: 'closeness', name: 'Closeness', question: 'When you need comfort, what speaks loudest?', optA: 'Acts of service — taking something off my plate', optB: 'Quality time and words of affirmation' }
];

export const SakinahMirrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    getMirror().then(res => {
      if (res.reflection_data) {
        setAnswers(res.reflection_data);
        // Start from where they left off, or 0 if complete/new
        const answeredCount = Object.keys(res.reflection_data).length;
        if (answeredCount > 0 && answeredCount < DIMENSIONS.length) {
          setCurrentIndex(answeredCount);
        }
      }
    }).catch(console.error);
  }, []);

  const handleNext = async (answerId?: string) => {
    const dim = DIMENSIONS[currentIndex];
    const newAnswers = { ...answers, [dim.id]: answerId || 'skip' };
    setAnswers(newAnswers);

    if (currentIndex < DIMENSIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      try {
        await updateMirror({ reflection_data: newAnswers });
        navigate('/matrimony/portrait');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const dim = DIMENSIONS[currentIndex];

  return (
    <SakinahJourneyFrame>
      <div className="flex items-center gap-[11px] mb-[18px]">
        <button className="sk-back" onClick={() => {
          if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
          else navigate('/matrimony/values');
        }}>‹</button>
        <div>
          <div className="font-serif text-[24px] text-[var(--sk-gold)] leading-[1.1]">The Mirror</div>
          <div className="text-[12px] text-[var(--sk-ink-faint)] tracking-[0.02em] mt-1">Phase 3 · character through gratitude</div>
        </div>
      </div>

      <div className="flex gap-[4px] mb-[22px]">
        {DIMENSIONS.map((_, i) => (
          <span 
            key={i} 
            className={`flex-1 h-[4px] rounded-[4px] transition-colors duration-300 ${i <= currentIndex ? 'bg-[var(--sk-gold)]' : 'bg-[rgba(212,168,83,0.15)]'}`} 
          />
        ))}
      </div>

      <div className="sk-dim-tag mb-[14px]">
        {currentIndex + 1} of 9 · {dim.name}
      </div>

      <SakinahReflectionCard
        question={dim.question}
        options={[
          { id: 'A', label: 'If you', text: dim.optA },
          { id: 'B', label: 'If you', text: dim.optB }
        ]}
        onSelect={handleNext}
        onSkip={() => handleNext('skip')}
      />

      <div className="bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.2)] rounded-[13px] p-[14px] text-[12px] text-[var(--sk-ink-dim)] leading-[1.5] mt-4 font-light">
        Nine dimensions reveal a <b className="font-medium text-[var(--sk-ink)]">value, not a preference</b>. The ninth — closeness — shapes your private portrait only; <b className="font-medium text-[var(--sk-ink)]">never</b> a topic before nikah.
      </div>
    </SakinahJourneyFrame>
  );
};
