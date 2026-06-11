import { Outlet, Link, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Matches', path: '/matches' },
    { name: 'Chat', path: '/chat' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E16] text-[#F5E8C7] font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2A2E36] bg-[#0F131D] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#2A2E36]">
          <Link to="/" className="text-2xl font-bold text-[#D4A853] tracking-wider">
            SAKINAH
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#1A1F2D] text-[#D4A853] font-medium border border-[#2A2E36]' 
                    : 'text-[#C9A85C] hover:bg-[#1A1F2D] hover:text-[#F5E8C7]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#2A2E36]">
          <Link to="/profile-setup" className="flex items-center gap-3 px-4 py-2 hover:bg-[#1A1F2D] rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1A1F2D] border border-[#D4A853] flex items-center justify-center text-[#D4A853] font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium">My Profile</p>
              <p className="text-xs text-[#7A7363]">Edit details</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[#2A2E36] bg-[#0F131D]">
          <span className="text-xl font-bold text-[#D4A853]">SAKINAH</span>
          <button className="text-[#C9A85C]">Menu</button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0A0E16]">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
