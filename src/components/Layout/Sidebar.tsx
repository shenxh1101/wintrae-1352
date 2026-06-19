import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  FileText,
  Sparkles,
  MessageSquare,
  BarChart3,
  Home,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: '房态看板', icon: CalendarDays },
  { path: '/orders', label: '订单管理', icon: FileText },
  { path: '/cleaning', label: '清洁排班', icon: Sparkles },
  { path: '/messages', label: '消息模板', icon: MessageSquare },
  { path: '/statistics', label: '经营统计', icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen bg-white border-r border-wood-100 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-16 flex items-center px-4 border-b border-wood-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wood-400 to-wood-600 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-serif font-semibold text-wood-800 leading-tight">
                山居小筑
              </h1>
              <p className="text-xs text-wood-400">民宿管理系统</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-wood-500 text-white shadow-md shadow-wood-500/30'
                  : 'text-wood-600 hover:bg-wood-50 hover:text-wood-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium animate-fade-in">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-wood-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
