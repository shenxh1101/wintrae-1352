import { useState, useRef } from 'react';
import {
  Clock,
  User,
  CheckCircle,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp,
  Play,
  MoreHorizontal,
  AlertTriangle,
  Sparkles,
  Users,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import StatusBadge from '@/components/StatusBadge';
import DataCard from '@/components/DataCard';
import { useAppStore } from '@/store/useAppStore';
import { CleaningTask, CleaningStatus } from '@/types';
import { cleaners as initialCleaners } from '@/data/cleaning';

const statusTabs: { key: CleaningStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待分配' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

export default function Cleaning() {
  const { cleaningTasks, updateCleaningTask, addCleaningPhoto } = useAppStore();
  const [activeTab, setActiveTab] = useState<CleaningStatus | 'all'>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [cleaners] = useState(initialCleaners);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTaskId, setCurrentUploadTaskId] = useState<string | null>(null);

  const filteredTasks = cleaningTasks
    .filter((t) => activeTab === 'all' || t.status === activeTab)
    .sort((a, b) => a.checkOutTime.localeCompare(b.checkOutTime));

  const getCleanerName = (id?: string) => {
    if (!id) return '未分配';
    const cleaner = cleaners.find((c) => c.id === id);
    return cleaner?.name || '未分配';
  };

  const getCleanerAvatar = (id?: string) => {
    if (!id) return null;
    const cleaner = cleaners.find((c) => c.id === id);
    return cleaner?.name.charAt(0);
  };

  const handleAssignCleaner = (taskId: string, cleanerId: string) => {
    updateCleaningTask(taskId, { assignedTo: cleanerId });
  };

  const handleStartTask = (taskId: string) => {
    updateCleaningTask(taskId, { status: 'in_progress' });
  };

  const handleCompleteTask = (taskId: string) => {
    updateCleaningTask(taskId, { status: 'completed', completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
  };

  const handlePhotoUpload = (taskId: string) => {
    setCurrentUploadTaskId(taskId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTaskId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      addCleaningPhoto(currentUploadTaskId, base64Url);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
    setCurrentUploadTaskId(null);
  };

  const handlePhotoClick = (photo: string) => {
    setPreviewPhoto(photo);
  };

  const stats = {
    pending: cleaningTasks.filter((t) => t.status === 'pending').length,
    inProgress: cleaningTasks.filter((t) => t.status === 'in_progress').length,
    completed: cleaningTasks.filter((t) => t.status === 'completed').length,
    total: cleaningTasks.length,
  };

  const TaskCard = ({ task }: { task: CleaningTask }) => {
    const isExpanded = expandedTask === task.id;

    return (
      <div
        className={`card overflow-hidden transition-all duration-300 ${
          isExpanded ? 'shadow-card' : 'card-hover'
        }`}
      >
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    task.status === 'completed'
                      ? 'bg-sage-400/10'
                      : task.status === 'in_progress'
                      ? 'bg-coral-400/10'
                      : 'bg-mist-300/30'
                  }`}
                >
                  <Sparkles
                    className={`w-6 h-6 ${
                      task.status === 'completed'
                        ? 'text-sage-500'
                        : task.status === 'in_progress'
                        ? 'text-coral-500'
                        : 'text-mist-500'
                    }`}
                  />
                </div>
                {task.priority === 'urgent' && (
                  <div className="absolute -top-1 -right-1">
                    <AlertTriangle className="w-4 h-4 text-coral-500" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-wood-800">{task.roomName}</h3>
                  <StatusBadge status={task.status} size="sm" />
                </div>
                <p className="text-sm text-wood-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  退房时间：{task.checkOutTime} · 预计 {task.estimatedDuration} 分钟
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {task.assignedTo ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-wood-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wood-300 to-wood-500 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {getCleanerAvatar(task.assignedTo)}
                      </span>
                    </div>
                    <span className="text-sm text-wood-600">
                      {getCleanerName(task.assignedTo)}
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-brick-400/10 rounded-lg">
                    <span className="text-sm text-brick-500">待分配</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {task.status === 'pending' && task.assignedTo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTask(task.id);
                    }}
                    className="p-2 rounded-lg bg-coral-400 text-white hover:bg-coral-500 transition-colors"
                    title="开始清洁"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteTask(task.id);
                    }}
                    className="p-2 rounded-lg bg-sage-400 text-white hover:bg-sage-500 transition-colors"
                    title="完成清洁"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-wood-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-wood-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-wood-50 pt-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-wood-700 mb-3">清洁人员</p>
                {task.assignedTo ? (
                  <div className="flex items-center gap-3 p-3 bg-wood-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wood-300 to-wood-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-wood-800">
                        {getCleanerName(task.assignedTo)}
                      </p>
                      <p className="text-xs text-wood-400">今日完成 2 单</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cleaners.map((cleaner) => (
                      <button
                        key={cleaner.id}
                        onClick={() => handleAssignCleaner(task.id, cleaner.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-wood-100 hover:border-wood-300 hover:bg-wood-50 transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wood-200 to-wood-400 flex items-center justify-center">
                          <span className="text-sm text-white font-medium">
                            {cleaner.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-wood-700 text-sm">
                            {cleaner.name}
                          </p>
                          <p className="text-xs text-wood-400">
                            今日 {cleaner.taskCount} 单 · 已完成 {cleaner.todayCompleted}
                          </p>
                        </div>
                        <span className="text-xs text-wood-400">分配</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-wood-700 mb-3">检查照片</p>
                <div className="grid grid-cols-4 gap-2">
                  {task.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-wood-100 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img
                        src={photo}
                        alt={`检查照片 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handlePhotoUpload(task.id)}
                    className="aspect-square rounded-lg border-2 border-dashed border-wood-200 flex flex-col items-center justify-center text-wood-400 hover:border-wood-400 hover:text-wood-600 transition-colors"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">上传</span>
                  </button>
                </div>
              </div>
            </div>

            {task.remark && (
              <div className="mt-4">
                <p className="text-sm font-medium text-wood-700 mb-2">备注</p>
                <p className="text-sm text-wood-500 bg-wood-50 p-3 rounded-lg">
                  {task.remark}
                </p>
              </div>
            )}

            {task.completedAt && (
              <div className="mt-4 flex items-center gap-2 text-sm text-wood-400">
                <CheckCircle className="w-4 h-4 text-sage-500" />
                完成时间：{task.completedAt}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout title="清洁排班" subtitle="管理清洁任务和人员分配">
      <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DataCard
            title="今日任务"
            value={stats.total}
            suffix="个"
            color="wood"
            icon={<Sparkles className="w-5 h-5" />}
          />
          <DataCard
            title="待分配"
            value={stats.pending}
            suffix="个"
            color="coral"
            icon={<Users className="w-5 h-5" />}
          />
          <DataCard
            title="进行中"
            value={stats.inProgress}
            suffix="个"
            color="bronze"
            icon={<Clock className="w-5 h-5" />}
          />
          <DataCard
            title="已完成"
            value={stats.completed}
            suffix="个"
            color="sage"
            icon={<CheckCircle className="w-5 h-5" />}
          />
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 bg-wood-50 rounded-xl">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-wood-700 shadow-sm'
                      : 'text-wood-500 hover:text-wood-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-wood-400">共 {filteredTasks.length} 个任务</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-wood-100"></div>

          <div className="space-y-3 relative">
            {filteredTasks.map((task, index) => (
              <div key={task.id} className="relative pl-10 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <div
                  className={`absolute left-4 top-6 w-3 h-3 rounded-full border-2 border-white ${
                    task.status === 'completed'
                      ? 'bg-sage-400'
                      : task.status === 'in_progress'
                      ? 'bg-coral-400'
                      : 'bg-mist-400'
                  }`}
                ></div>

                <div className="text-xs text-wood-400 mb-1 font-medium">
                  {task.checkOutTime} 退房
                </div>

                <TaskCard task={task} />
              </div>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-wood-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-wood-300" />
            </div>
            <p className="text-wood-400">暂无清洁任务</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={previewPhoto}
              alt="预览照片"
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={() => setPreviewPhoto(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
