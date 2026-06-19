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
  Search,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import Modal from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { messageCategories } from '@/data/messages';
import { MessageTemplate } from '@/types';
import { formatDate } from '@/utils/date';

const iconMap: Record<string, typeof Key> = {
  key: Key,
  car: Car,
  calendar: Calendar,
  'door-open': DoorOpen,
  heart: Heart,
  info: Info,
};

export default function Messages() {
  const { messageTemplates, useTemplate, deleteTemplate, addTemplate, updateTemplate } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'checkin',
    variables: '' as string,
  });

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

  const handleNew = () => {
    setEditingTemplate(null);
    setFormData({
      title: '',
      content: '',
      category: 'checkin',
      variables: '',
    });
    setShowEditModal(true);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category,
      variables: template.variables.join(', '),
    });
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    const variables = formData.variables
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (editingTemplate) {
      updateTemplate({
        ...editingTemplate,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        variables,
      });
    } else {
      const newTemplate: MessageTemplate = {
        id: `template-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        variables,
        useCount: 0,
        createdAt: formatDate(new Date()),
      };
      addTemplate(newTemplate);
    }

    setShowEditModal(false);
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
          <button
            onClick={handleNew}
            className="flex items-center gap-2 btn-primary"
          >
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

                {template.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.variables.map((v, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-wood-100 text-wood-500 rounded-md"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}

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
            <button onClick={handleNew} className="btn-primary">
              <Plus className="w-4 h-4 mr-1" />
              新建模板
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={editingTemplate ? '编辑模板' : '新建模板'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label-text">模板标题</label>
            <input
              type="text"
              placeholder="请输入模板标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              {messageCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">模板内容</label>
            <textarea
              rows={8}
              placeholder="请输入模板内容，支持使用 {{变量名}} 作为占位符"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field font-mono text-sm"
            />
          </div>

          <div>
            <label className="label-text">
              变量（用逗号分隔）
            </label>
            <input
              type="text"
              placeholder="例如：客人姓名, 民宿名称, WiFi密码"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-wood-400 mt-1">
              在内容中使用 {'{{变量名}}'} 作为占位符，例如：{'{{客人姓名}} 您好！'}
            </p>
          </div>

          {formData.variables && (
            <div className="flex flex-wrap gap-2">
              {formData.variables
                .split(',')
                .map((v) => v.trim())
                .filter((v) => v)
                .map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-wood-100 text-wood-500 rounded-md"
                  >
                    {'{{' + v + '}}'}
                  </span>
                ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-wood-600 rounded-lg hover:bg-wood-50 transition-colors"
            >
              取消
            </button>
            <button onClick={handleSave} className="btn-primary">
              {editingTemplate ? '保存修改' : '创建模板'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
