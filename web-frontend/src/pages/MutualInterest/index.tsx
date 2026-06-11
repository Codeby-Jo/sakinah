import { Link } from 'react-router-dom';

export default function MutualInterest() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-12 flex items-center justify-center w-full max-w-sm">
        {/* User 1 Photo */}
        <div className="w-24 h-24 rounded-full bg-[#1A1F2D] border-4 border-[#0A0E16] absolute -translate-x-8 z-10 overflow-hidden shadow-2xl">
          <img src="https://via.placeholder.com/150" alt="You" className="w-full h-full object-cover" />
        </div>
        {/* User 2 Photo */}
        <div className="w-24 h-24 rounded-full bg-[#1A1F2D] border-4 border-[#0A0E16] absolute translate-x-8 z-20 overflow-hidden shadow-2xl">
          <img src="https://via.placeholder.com/150" alt="Match" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-6 z-30 text-3xl bg-[#0A0E16] rounded-full">
          💖
        </div>
      </div>

      <h1 className="text-4xl font-bold text-[#F5E8C7] mb-4">It's a Mutual Interest!</h1>
      <p className="text-xl text-[#C9A85C] max-w-lg mb-10">
        Alhamdulillah, Aisha M. also expressed interest in your profile. Your photos are now visible to each other and your chat has been unlocked.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/chat" className="bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(212,168,83,0.3)]">
          Start Chatting Now
        </Link>
        <Link to="/dashboard" className="border border-[#2A2E36] text-[#F5E8C7] px-8 py-4 rounded-full font-bold hover:bg-[#1A1F2D] transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
