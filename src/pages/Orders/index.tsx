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
  const { orders, rooms, updateOrderStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);

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
    updateOrderStatus(orderId, 'checked_in');
  };

  const handleCheckOut = (orderId: string) => {
    updateOrderStatus(orderId, 'checked_out');
  };

  const handleCancel = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
  };

  const OrderDetail = ({ order }: { order: Order }) => (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-wood-900/30 backdrop-blur-sm"
        onClick={() => setShowDetail(false)}
      ></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-float animate-slide-right overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-wood-100 p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-serif font-semibold text-wood-800">订单详情</h3>
            <p className="text-sm text-wood-400 mt-0.5">{order.orderNo}</p>
          </div>
          <button
            onClick={() => setShowDetail(false)}
            className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <span className="text-2xl font-serif font-bold text-wood-700">
              {formatMoney(order.price)}
            </span>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wood-300 to-wood-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-wood-800">{order.guestName}</p>
                <p className="text-sm text-wood-400">{order.guestPhone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-wood-400">身份证号</p>
                <p className="text-wood-700 font-medium">{order.guestIdNo}</p>
              </div>
              <div>
                <p className="text-wood-400">入住人数</p>
                <p className="text-wood-700 font-medium">{order.guestCount} 人</p>
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
                <span className="text-wood-700 font-medium">{getRoomName(order.roomId)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wood-400">入住日期</span>
                <span className="text-wood-700 font-medium">{order.checkInDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wood-400">退房日期</span>
                <span className="text-wood-700 font-medium">{order.checkOutDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wood-400">入住天数</span>
                <span className="text-wood-700 font-medium">{getNights(order)} 晚</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wood-400">到店时间</span>
                <span className="text-wood-700 font-medium">{order.checkInTime || '预计 14:00'}</span>
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
                <span className="text-wood-700 font-medium">{formatMoney(order.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wood-400">押金</span>
                <span className="text-wood-700 font-medium">{formatMoney(order.deposit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wood-400">预订渠道</span>
                <span className="text-wood-700 font-medium">{order.channel}</span>
              </div>
              <div className="pt-3 border-t border-wood-100 flex items-center justify-between">
                <span className="text-wood-600 font-medium">总计</span>
                <span className="text-xl font-serif font-bold text-wood-800">
                  {formatMoney(order.price + order.deposit)}
                </span>
              </div>
            </div>
          </div>

          {order.specialRequirements && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-wood-500" />
                <span className="text-sm font-medium text-wood-700">特殊需求</span>
              </div>
              <p className="text-sm text-wood-600 bg-wood-50 p-3 rounded-lg">
                {order.specialRequirements}
              </p>
            </div>
          )}

          {order.invoiceRemark && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-wood-500" />
                <span className="text-sm font-medium text-wood-700">发票备注</span>
              </div>
              <p className="text-sm text-wood-600 bg-wood-50 p-3 rounded-lg">
                {order.invoiceRemark}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {order.status === 'pending' && (
              <button
                onClick={() => {
                  handleCheckIn(order.id);
                  setSelectedOrder({ ...order, status: 'checked_in' });
                }}
                className="w-full py-3 bg-sage-400 text-white rounded-xl font-medium hover:bg-sage-500 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                办理入住
              </button>
            )}
            {order.status === 'checked_in' && (
              <button
                onClick={() => {
                  handleCheckOut(order.id);
                  setSelectedOrder({ ...order, status: 'checked_out' });
                }}
                className="w-full py-3 bg-coral-400 text-white rounded-xl font-medium hover:bg-coral-500 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                办理退房
              </button>
            )}
            <button className="w-full py-3 border border-wood-200 text-wood-600 rounded-xl font-medium hover:bg-wood-50 transition-colors flex items-center justify-center gap-2">
              <Edit2 className="w-5 h-5" />
              编辑订单
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
