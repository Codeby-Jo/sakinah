export default function Chat() {
  const isMutualInterest = true; // Simulating mutual interest for the sake of the UI
  
  if (!isMutualInterest) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-[#F5E8C7] mb-4">Chat Locked</h1>
        <p className="text-[#C9A85C]">You can only chat with users who have mutually expressed interest in your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 h-[80vh] flex flex-col">
      <div className="bg-[#1A1F2D] border border-[#2A2E36] p-4 rounded-t-3xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#0A0E16] border border-[#D4A853] flex items-center justify-center text-xl overflow-hidden">
          {/* Simulated unblurred photo since mutual interest exists */}
          <img src="https://via.placeholder.com/150" alt="Match" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-bold text-[#F5E8C7]">Aisha M.</h2>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      <div className="flex-1 bg-[#0F131D] border-x border-[#2A2E36] p-6 overflow-y-auto space-y-4">
        <div className="text-center text-xs text-[#7A7363] my-4">Today</div>
        
        <div className="flex justify-start">
          <div className="bg-[#1A1F2D] text-[#F5E8C7] p-4 rounded-2xl rounded-tl-sm max-w-[80%] border border-[#2A2E36]">
            Assalamu alaikum! I noticed we have very similar views on family values and Deen. It's nice to connect.
            <div className="text-[10px] text-[#7A7363] mt-2 text-right">10:42 AM</div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-[#D4A853] text-[#0A0E16] p-4 rounded-2xl rounded-tr-sm max-w-[80%]">
            Wa alaikum assalam! Yes, Alhamdulillah. I was really impressed by your profile. How is your day going?
            <div className="text-[10px] text-[#0A0E16]/70 mt-2 text-right">10:45 AM</div>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1F2D] border border-[#2A2E36] p-4 rounded-b-3xl">
        <form className="flex gap-4" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-[#0A0E16] border border-[#2A2E36] rounded-full px-6 py-3 text-[#F5E8C7] focus:outline-none focus:border-[#D4A853]"
          />
          <button type="submit" className="bg-[#D4A853] text-[#0A0E16] px-8 rounded-full font-bold hover:bg-[#E8C97A] transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
