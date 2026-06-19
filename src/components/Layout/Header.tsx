import { Bell, Search, User } from 'lucide-react';
import { formatChineseDate } from '@/utils/date';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const today = new Date();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-wood-100 px-6 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-serif font-semibold text-wood-800">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-wood-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-wood-700">
            {formatChineseDate(today)}
          </p>
          <p className="text-xs text-wood-400">今日营业中</p>
        </div>

        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wood-300" />
          <input
            type="text"
            placeholder="搜索..."
            className="pl-9 pr-4 py-2 w-48 bg-wood-50 border border-wood-100 rounded-lg text-sm text-wood-700 placeholder-wood-300 focus:outline-none focus:ring-2 focus:ring-wood-400 focus:bg-white transition-all"
          />
        </div>

        <button className="relative p-2 rounded-lg text-wood-500 hover:bg-wood-50 hover:text-wood-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-400 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-wood-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-wood-300 to-wood-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-wood-700">管理员</p>
            <p className="text-xs text-wood-400">店主</p>
          </div>
        </div>
      </div>
    </header>
  );
}
