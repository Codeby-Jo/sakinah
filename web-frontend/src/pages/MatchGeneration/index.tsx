import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatchGeneration() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate generation delay
    const timer = setTimeout(() => {
      navigate('/matches');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 border-4 border-[#2A2E36] border-t-[#D4A853] rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(212,168,83,0.3)]"></div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#F5E8C7] mb-4">Generating Matches...</h1>
      <p className="text-xl text-[#C9A85C] max-w-lg mb-10">
        Our proprietary NIS psychology engine is currently analyzing your values, preferences, and lifestyle to find the most compatible profiles in our community.
      </p>
    </div>
  );
}
