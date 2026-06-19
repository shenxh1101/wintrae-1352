import { useState } from 'react';
import {
  Copy,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Key,
  Car,
  Calendar,
  DoorOpen,
  Heart,
  Info,
  Check,
  X,
  Search,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAppStore } from '@/store/useAppStore';
import { messageCategories } from '@/data/messages';
import { MessageTemplate } from '@/types';

const iconMap: Record<string, typeof Key> = {
  key: Key,
  car: Car,
  calendar: Calendar,
  'door-open': DoorOpen,
  heart: Heart,
  info: Info,
};

export default function Messages() {
  const { messageTemplates, useTemplate, deleteTemplate } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const filteredTemplates = messageTemplates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      searchText === '' ||
      t.title.includes(searchText) ||
      t.content.includes(searchText);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.content);
    useTemplate(template.id);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      deleteTemplate(templateId);
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setShowEditModal(true);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = messageCategories.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  };

  return (
    <Layout title="消息模板" subtitle="管理常用消息模板，提升沟通效率">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wood-300" />
              <input
                type="text"
                placeholder="搜索模板..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input-field pl-9 w-64"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 btn-primary">
            <Plus className="w-4 h-4" />
            新建模板
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeCategory === 'all'
                ? 'bg-wood-500 text-white shadow-md shadow-wood-500/30'
                : 'bg-white text-wood-600 hover:bg-wood-50 border border-wood-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            全部模板
          </button>
          {messageCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || MessageSquare;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-wood-500 text-white shadow-md shadow-wood-500/30'
                    : 'bg-white text-wood-600 hover:bg-wood-50 border border-wood-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="card card-hover overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-wood-800">{template.title}</h3>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs bg-wood-50 text-wood-500 rounded-full">
                      {getCategoryName(template.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-1.5 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 rounded-lg text-wood-400 hover:bg-brick-400/10 hover:text-brick-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={`text-sm text-wood-500 leading-relaxed cursor-pointer ${
                    expandedId === template.id ? '' : 'line-clamp-3'
                  }`}
                  onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                >
                  <pre className="whitespace-pre-wrap font-sans">{template.content}</pre>
                </div>

                <div className="mt-4 pt-4 border-t border-wood-50 flex items-center justify-between">
                  <span className="text-xs text-wood-400">使用 {template.useCount} 次</span>
                  <button
                    onClick={() => handleCopy(template)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copiedId === template.id
                        ? 'bg-sage-400 text-white'
                        : 'bg-wood-50 text-wood-600 hover:bg-wood-100'
                    }`}
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制内容
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-wood-50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-wood-300" />
            </div>
            <p className="text-wood-400 mb-4">暂无消息模板</p>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-1" />
              新建模板
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
