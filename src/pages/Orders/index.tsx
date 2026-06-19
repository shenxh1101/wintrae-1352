import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  ChevronRight,
  X,
  Edit2,
  CheckCircle,
  LogOut,
  User,
  Save,
  AlertCircle,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { Order, OrderStatus } from '@/types';
import { formatMoney, diffDays } from '@/utils/date';

const statusTabs: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待入住' },
  { key: 'checked_in', label: '已入住' },
  { key: 'checked_out', label: '已退房' },
  { key: 'cancelled', label: '已取消' },
];

export default function Orders() {
  const { orders, rooms, checkInOrder, checkOutOrder, updateOrderStatus, saveOrderEdit } = useAppStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    deposit: 0,
    specialRequirements: '',
    invoiceRemark: '',
  });

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeTab === 'all' || order.status === activeTab;
    const matchesSearch =
      searchText === '' ||
      order.guestName.includes(searchText) ||
      order.orderNo.includes(searchText) ||
      order.guestPhone.includes(searchText);
    return matchesStatus && matchesSearch;
  });

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? `${room.name} ${room.type}` : '未知房间';
  };

  const getNights = (order: Order) => {
    const checkIn = new Date(order.checkInDate);
    const checkOut = new Date(order.checkOutDate);
    return diffDays(checkIn, checkOut);
  };

  const handleCheckIn = (orderId: string) => {
    checkInOrder(orderId);
    const updated = orders.find((o) => o.id === orderId);
    if (updated) {
      setSelectedOrder({ ...updated, status: 'checked_in' });
    }
  };

  const handleCheckOut = (orderId: string) => {
    checkOutOrder(orderId);
    const updated = orders.find((o) => o.id === orderId);
    if (updated) {
      setSelectedOrder({ ...updated, status: 'checked_out' });
    }
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
  };

  const startEdit = (order: Order) => {
    setEditForm({
      roomId: order.roomId,
      checkInDate: order.checkInDate,
      checkOutDate: order.checkOutDate,
      deposit: order.deposit,
      specialRequirements: order.specialRequirements || '',
      invoiceRemark: order.invoiceRemark || '',
    });
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedOrder) return;
    setEditError(null);

    const updates: Partial<Order> = {
      roomId: editForm.roomId,
      checkInDate: editForm.checkInDate,
      checkOutDate: editForm.checkOutDate,
      deposit: editForm.deposit,
      specialRequirements: editForm.specialRequirements || undefined,
      invoiceRemark: editForm.invoiceRemark || undefined,
    };

    const result = saveOrderEdit(selectedOrder.id, updates);
    if (!result.success) {
      setEditError(result.error || '保存失败');
      return;
    }

    const updated = orders.find((o) => o.id === selectedOrder.id);
    if (updated) {
      setSelectedOrder({ ...updated, ...updates });
    }
    setIsEditing(false);
  };

  const OrderDetail = ({ order }: { order: Order }) => {
    const currentOrder = orders.find((o) => o.id === order.id) || order;
    const nights = getNights(currentOrder);

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="absolute inset-0 bg-wood-900/30 backdrop-blur-sm"
          onClick={() => {
            setShowDetail(false);
            setIsEditing(false);
          }}
        ></div>
        <div className="relative w-full max-w-md bg-white h-full shadow-float animate-slide-right overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-wood-100 p-5 flex items-center justify-between z-10">
            <div>
              <h3 className="text-lg font-serif font-semibold text-wood-800">
                {isEditing ? '编辑订单' : '订单详情'}
              </h3>
              <p className="text-sm text-wood-400 mt-0.5">{currentOrder.orderNo}</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg bg-sage-400 text-white hover:bg-sage-500 transition-colors"
                  title="保存"
                >
                  <Save className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => startEdit(currentOrder)}
                  className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  setShowDetail(false);
                  setIsEditing(false);
                }}
                className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {editError && (
              <div className="flex items-center gap-2 p-3 bg-brick-400/10 border border-brick-400/30 rounded-lg text-brick-500 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {editError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <StatusBadge status={currentOrder.status} />
              <span className="text-2xl font-serif font-bold text-wood-700">
                {formatMoney(currentOrder.price)}
              </span>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wood-300 to-wood-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-wood-800">{currentOrder.guestName}</p>
                  <p className="text-sm text-wood-400">{currentOrder.guestPhone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-wood-400">身份证号</p>
                  <p className="text-wood-700 font-medium">{currentOrder.guestIdNo}</p>
                </div>
                <div>
                  <p className="text-wood-400">入住人数</p>
                  <p className="text-wood-700 font-medium">{currentOrder.guestCount} 人</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-wood-500" />
                <span className="text-sm font-medium text-wood-700">入住信息</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">房间</span>
                  {isEditing ? (
                    <select
                      value={editForm.roomId}
                      onChange={(e) => setEditForm({ ...editForm, roomId: e.target.value })}
                      className="text-wood-700 font-medium bg-wood-50 border border-wood-200 rounded-md px-2 py-1 text-sm"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.type}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-wood-700 font-medium">{getRoomName(currentOrder.roomId)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">入住日期</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.checkInDate}
                      onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                      className="text-wood-700 font-medium bg-wood-50 border border-wood-200 rounded-md px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-wood-700 font-medium">{currentOrder.checkInDate}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">退房日期</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.checkOutDate}
                      onChange={(e) => setEditForm({ ...editForm, checkOutDate: e.target.value })}
                      className="text-wood-700 font-medium bg-wood-50 border border-wood-200 rounded-md px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-wood-700 font-medium">{currentOrder.checkOutDate}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">入住天数</span>
                  <span className="text-wood-700 font-medium">{nights} 晚</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">到店时间</span>
                  <span className="text-wood-700 font-medium">{currentOrder.checkInTime || '预计 14:00'}</span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-wood-500" />
                <span className="text-sm font-medium text-wood-700">费用信息</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">房费</span>
                  <span className="text-wood-700 font-medium">{formatMoney(currentOrder.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">押金</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.deposit}
                      onChange={(e) => setEditForm({ ...editForm, deposit: Number(e.target.value) })}
                      className="text-wood-700 font-medium bg-wood-50 border border-wood-200 rounded-md px-2 py-1 text-sm w-24 text-right"
                    />
                  ) : (
                    <span className="text-wood-700 font-medium">{formatMoney(currentOrder.deposit)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-wood-400">预订渠道</span>
                  <span className="text-wood-700 font-medium">{currentOrder.channel}</span>
                </div>
                <div className="pt-3 border-t border-wood-100 flex items-center justify-between">
                  <span className="text-wood-600 font-medium">总计</span>
                  <span className="text-xl font-serif font-bold text-wood-800">
                    {formatMoney(currentOrder.price + (isEditing ? editForm.deposit : currentOrder.deposit))}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-wood-500" />
                <span className="text-sm font-medium text-wood-700">特殊需求</span>
              </div>
              {isEditing ? (
                <textarea
                  value={editForm.specialRequirements}
                  onChange={(e) => setEditForm({ ...editForm, specialRequirements: e.target.value })}
                  placeholder="例如：需要高楼层、安静、婴儿床等"
                  className="w-full text-sm text-wood-600 bg-wood-50 p-3 rounded-lg border border-wood-200 min-h-[80px] focus:outline-none focus:border-wood-400"
                />
              ) : currentOrder.specialRequirements ? (
                <p className="text-sm text-wood-600 bg-wood-50 p-3 rounded-lg">
                  {currentOrder.specialRequirements}
                </p>
              ) : (
                <p className="text-sm text-wood-400">无特殊需求</p>
              )}
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-wood-500" />
                <span className="text-sm font-medium text-wood-700">发票备注</span>
              </div>
              {isEditing ? (
                <textarea
                  value={editForm.invoiceRemark}
                  onChange={(e) => setEditForm({ ...editForm, invoiceRemark: e.target.value })}
                  placeholder="发票抬头、税号等信息"
                  className="w-full text-sm text-wood-600 bg-wood-50 p-3 rounded-lg border border-wood-200 min-h-[80px] focus:outline-none focus:border-wood-400"
                />
              ) : currentOrder.invoiceRemark ? (
                <p className="text-sm text-wood-600 bg-wood-50 p-3 rounded-lg">
                  {currentOrder.invoiceRemark}
                </p>
              ) : (
                <p className="text-sm text-wood-400">无发票备注</p>
              )}
            </div>

            {!isEditing && (
              <div className="space-y-2">
                {currentOrder.status === 'pending' && (
                  <button
                    onClick={() => handleCheckIn(currentOrder.id)}
                    className="w-full py-3 bg-sage-400 text-white rounded-xl font-medium hover:bg-sage-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    办理入住
                  </button>
                )}
                {currentOrder.status === 'checked_in' && (
                  <button
                    onClick={() => handleCheckOut(currentOrder.id)}
                    className="w-full py-3 bg-coral-400 text-white rounded-xl font-medium hover:bg-coral-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    办理退房
                  </button>
                )}
                {currentOrder.status !== 'cancelled' && currentOrder.status !== 'checked_out' && (
                  <button
                    onClick={() => handleCancel(currentOrder.id)}
                    className="w-full py-3 border border-brick-400/30 text-brick-500 rounded-xl font-medium hover:bg-brick-400/10 transition-colors flex items-center justify-center gap-2"
                  >
                    取消订单
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="订单管理" subtitle="查看和管理所有订单">
      <div className="space-y-5 animate-fade-in">
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wood-300" />
              <input
                type="text"
                placeholder="搜索订单号、客人姓名、手机号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input-field pl-9"
              />
            </div>

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

            <button className="flex items-center gap-2 btn-secondary">
              <Filter className="w-4 h-4" />
              筛选
            </button>

            <button className="flex items-center gap-2 btn-primary">
              <Plus className="w-4 h-4" />
              新建订单
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="card p-5 card-hover cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.03}s` }}
              onClick={() => {
                setSelectedOrder(order);
                setIsEditing(false);
                setEditError(null);
                setShowDetail(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-wood-100 to-wood-200 flex items-center justify-center">
                    <User className="w-7 h-7 text-wood-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-medium text-wood-800">
                        {order.guestName}
                      </h3>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <p className="text-sm text-wood-400 mt-1">
                      {order.orderNo} · {order.channel}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-wood-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {order.checkInDate} → {order.checkOutDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getRoomName(order.roomId)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {order.guestPhone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-serif font-bold text-wood-700">
                    {formatMoney(order.price)}
                  </p>
                  <p className="text-xs text-wood-400 mt-0.5">
                    {getNights(order)} 晚 · {order.guestCount} 人
                  </p>
                  <ChevronRight className="w-5 h-5 text-wood-300 ml-auto mt-2" />
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-wood-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-wood-300" />
              </div>
              <p className="text-wood-400">暂无订单数据</p>
            </div>
          )}
        </div>

        {showDetail && selectedOrder && <OrderDetail order={selectedOrder} />}
      </div>
    </Layout>
  );
}
