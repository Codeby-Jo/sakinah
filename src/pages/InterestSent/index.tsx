import { Link } from 'react-router-dom';

export default function InterestSent() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-[#1A1F2D] border-2 border-[#D4A853] rounded-full flex items-center justify-center text-4xl mb-8 shadow-[0_0_30px_rgba(212,168,83,0.3)]">
        💌
      </div>
      <h1 className="text-4xl font-bold text-[#F5E8C7] mb-4">Interest Sent Successfully</h1>
      <p className="text-xl text-[#C9A85C] max-w-lg mb-10">
        We have notified the other party of your interest. If they also express interest in your profile, your photos will be unblurred and you will be able to chat.
      </p>
      <div className="flex gap-4">
        <Link to="/matches" className="bg-[#D4A853] text-[#0A0E16] px-8 py-3 rounded-full font-bold hover:bg-[#E8C97A] transition-colors">
          Keep Exploring Matches
        </Link>
        <Link to="/dashboard" className="border border-[#2A2E36] text-[#F5E8C7] px-8 py-3 rounded-full font-bold hover:bg-[#1A1F2D] transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
