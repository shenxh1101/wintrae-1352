import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Users,
  BedDouble,
  Wrench,
  Sparkles,
  X,
  Save,
  User,
  Calendar,
  CreditCard,
  FileText,
  Phone,
  AlertCircle,
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import StatusBadge from '@/components/StatusBadge';
import DataCard from '@/components/DataCard';
import { useAppStore } from '@/store/useAppStore';
import { CalendarCellData, RoomStatusType, Order } from '@/types';
import { formatDate, addDays, isToday, getWeekDates, isSameDay, formatMoney, diffDays } from '@/utils/date';

const statusColors: Record<RoomStatusType, string> = {
  pending: 'bg-bronze-400',
  occupied: 'bg-sage-400',
  checkout: 'bg-coral-400',
  available: 'bg-mist-300',
  maintenance: 'bg-brick-400',
};

const statusBgColors: Record<RoomStatusType, string> = {
  pending: 'bg-bronze-400/10 hover:bg-bronze-400/20',
  occupied: 'bg-sage-400/10 hover:bg-sage-400/20',
  checkout: 'bg-coral-400/10 hover:bg-coral-400/20',
  available: 'bg-mist-300/20 hover:bg-mist-300/40',
  maintenance: 'bg-brick-400/10 hover:bg-brick-400/20',
};

interface CellClickData {
  roomId: string;
  date: string;
  orderId?: string;
}

export default function Dashboard() {
  const { rooms, orders, addOrder, getOrderById, checkRoomConflict } = useAppStore();
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<RoomStatusType | 'all'>('all');
  const [hoveredCell, setHoveredCell] = useState<{ roomId: string; date: string } | null>(null);

  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [clickedCell, setClickedCell] = useState<CellClickData | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const [newOrderForm, setNewOrderForm] = useState({
    guestName: '',
    guestPhone: '',
    guestIdNo: '',
    guestCount: 2,
    checkInDate: '',
    checkOutDate: '',
    price: 0,
    deposit: 500,
    channel: '携程',
    specialRequirements: '',
    invoiceRemark: '',
  });
  const [newOrderError, setNewOrderError] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const calendarData = useMemo(() => {
    const data: Record<string, CalendarCellData[]> = {};

    rooms.forEach((room) => {
      const cells: CalendarCellData[] = [];

      weekDates.forEach((date) => {
        const dateStr = formatDate(date);
        let status: RoomStatusType = room.status === 'maintenance' ? 'maintenance' : 'available';
        let orderId: string | undefined;
        let guestName: string | undefined;
        let nights: number | undefined;

        const roomOrders = orders.filter(
          (o) => o.roomId === room.id && o.status !== 'cancelled'
        );

        for (const order of roomOrders) {
          const checkIn = new Date(order.checkInDate);
          const checkOut = new Date(order.checkOutDate);

          const isCheckOutDate = isSameDay(date, checkOut);
          const isInStayPeriod = date >= checkIn && date < checkOut;

          if (isCheckOutDate) {
            status = 'checkout';
            orderId = order.id;
            guestName = order.guestName;
            nights = Math.ceil(
              (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );
            break;
          } else if (isInStayPeriod) {
            if (order.status === 'checked_in') {
              status = 'occupied';
            } else if (order.status === 'pending') {
              status = 'pending';
            }
            orderId = order.id;
            guestName = order.guestName;
            nights = Math.ceil(
              (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );
            break;
          }
        }

        cells.push({
          roomId: room.id,
          date: dateStr,
          status,
          orderId,
          guestName,
          nights,
        });
      });

      data[room.id] = cells;
    });

    return data;
  }, [rooms, orders, weekDates]);

  const stats = useMemo(() => {
    const todayStr = formatDate(new Date());
    let pending = 0;
    let occupied = 0;
    let checkout = 0;
    let available = 0;
    let maintenance = 0;

    rooms.forEach((room) => {
      const todayCell = calendarData[room.id]?.find((c) => c.date === todayStr);
      if (todayCell) {
        switch (todayCell.status) {
          case 'pending':
            pending++;
            break;
          case 'occupied':
            occupied++;
            break;
          case 'checkout':
            checkout++;
            break;
          case 'available':
            available++;
            break;
          case 'maintenance':
            maintenance++;
            break;
        }
      }
    });

    return { pending, occupied, checkout, available, maintenance, total: rooms.length };
  }, [rooms, calendarData]);

  const filteredRooms = useMemo(() => {
    if (selectedStatus === 'all') return rooms;
    const todayStr = formatDate(new Date());
    return rooms.filter((room) => {
      const todayCell = calendarData[room.id]?.find((c) => c.date === todayStr);
      return todayCell?.status === selectedStatus;
    });
  }, [rooms, calendarData, selectedStatus]);

  const prevWeek = () => setBaseDate((d) => addDays(d, -7));
  const nextWeek = () => setBaseDate((d) => addDays(d, 7));
  const goToToday = () => setBaseDate(new Date());

  const getWeekLabel = () => {
    const start = weekDates[0];
    const end = weekDates[weekDates.length - 1];
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  };

  const handleCellClick = (roomId: string, date: string, status: RoomStatusType, orderId?: string) => {
    setClickedCell({ roomId, date, orderId });
    if (orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setDetailOrder(order);
        setShowOrderDetail(true);
      }
    } else if (status === 'available') {
      const room = rooms.find((r) => r.id === roomId);
      setNewOrderForm({
        guestName: '',
        guestPhone: '',
        guestIdNo: '',
        guestCount: 2,
        checkInDate: date,
        checkOutDate: formatDate(addDays(new Date(date), 1)),
        price: room?.price || 388,
        deposit: 500,
        channel: '携程',
        specialRequirements: '',
        invoiceRemark: '',
      });
      setNewOrderError(null);
      setShowNewOrder(true);
    }
  };

  const handleCreateOrder = () => {
    if (!clickedCell) return;
    setNewOrderError(null);

    if (!newOrderForm.guestName) {
      setNewOrderError('请填写客人姓名');
      return;
    }
    if (!newOrderForm.guestPhone) {
      setNewOrderError('请填写客人手机号');
      return;
    }
    if (!newOrderForm.checkInDate || !newOrderForm.checkOutDate) {
      setNewOrderError('请选择入住和退房日期');
      return;
    }
    if (new Date(newOrderForm.checkOutDate) <= new Date(newOrderForm.checkInDate)) {
      setNewOrderError('退房日期必须晚于入住日期');
      return;
    }

    if (checkRoomConflict(clickedCell.roomId, newOrderForm.checkInDate, newOrderForm.checkOutDate)) {
      setNewOrderError('该房间在所选日期已有预订，请更换日期');
      return;
    }

    const newOrder: Order = {
      id: `o-${Date.now()}`,
      orderNo: `MS${formatDate(new Date(), 'YYYYMMDD')}${String(orders.length + 1).padStart(3, '0')}`,
      roomId: clickedCell.roomId,
      guestName: newOrderForm.guestName,
      guestPhone: newOrderForm.guestPhone,
      guestIdNo: newOrderForm.guestIdNo,
      checkInDate: newOrderForm.checkInDate,
      checkOutDate: newOrderForm.checkOutDate,
      price: newOrderForm.price,
      deposit: newOrderForm.deposit,
      channel: newOrderForm.channel,
      status: 'pending',
      specialRequirements: newOrderForm.specialRequirements || undefined,
      invoiceRemark: newOrderForm.invoiceRemark || undefined,
      createdAt: formatDate(new Date()),
      guestCount: newOrderForm.guestCount,
    };

    addOrder(newOrder);
    setShowNewOrder(false);
  };

  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const room = clickedCell ? rooms.find((r) => r.id === clickedCell.roomId) : null;

  return (
    <Layout title="房态看板" subtitle="实时掌握所有房间状态">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <DataCard
            title="待入住"
            value={stats.pending}
            suffix="间"
            color="bronze"
            icon={<Calendar className="w-5 h-5" />}
          />
          <DataCard
            title="已入住"
            value={stats.occupied}
            suffix={`/ ${stats.total} 间`}
            color="sage"
            icon={<Users className="w-5 h-5" />}
            trend={0.05}
            trendLabel="较昨日"
          />
          <DataCard
            title="今日退房"
            value={stats.checkout}
            suffix="间"
            color="coral"
            icon={<BedDouble className="w-5 h-5" />}
          />
          <DataCard
            title="空房"
            value={stats.available}
            suffix="间"
            color="mist"
            icon={<Sparkles className="w-5 h-5" />}
          />
          <DataCard
            title="维修中"
            value={stats.maintenance}
            suffix="间"
            color="wood"
            icon={<Wrench className="w-5 h-5" />}
          />
        </div>

        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={prevWeek}
                className="p-2 rounded-lg bg-wood-50 text-wood-600 hover:bg-wood-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center min-w-[140px]">
                <p className="text-lg font-serif font-semibold text-wood-800">
                  {getWeekLabel()}
                </p>
                <p className="text-xs text-wood-400">未来两周房态</p>
              </div>
              <button
                onClick={nextWeek}
                className="p-2 rounded-lg bg-wood-50 text-wood-600 hover:bg-wood-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="ml-2 px-3 py-1.5 text-sm font-medium text-wood-600 bg-wood-50 rounded-lg hover:bg-wood-100 transition-colors"
              >
                今天
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                {(['pending', 'occupied', 'checkout', 'available', 'maintenance'] as RoomStatusType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(selectedStatus === s ? 'all' : s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedStatus === s
                        ? 'bg-wood-500 text-white'
                        : 'text-wood-600 hover:bg-wood-50'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColors[s]}`}></span>
                    <StatusBadge status={s} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[120px_repeat(14,1fr)] border-b border-wood-100 pb-3 mb-3">
                <div className="text-sm font-medium text-wood-400">房间</div>
                {weekDates.map((date, idx) => (
                  <div
                    key={idx}
                    className={`text-center ${
                      isToday(date) ? 'text-wood-600 font-semibold' : 'text-wood-500'
                    }`}
                  >
                    <p className="text-xs">{weekdays[idx]}</p>
                    <p className={`text-lg font-serif ${isToday(date) ? 'text-wood-500' : ''}`}>
                      {date.getDate()}
                    </p>
                    {isToday(date) && (
                      <div className="w-6 h-0.5 bg-wood-500 rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="grid grid-cols-[120px_repeat(14,1fr)] gap-1 items-center py-2 border-b border-wood-50 last:border-0"
                  >
                    <div className="pr-3">
                      <p className="text-sm font-medium text-wood-700">{room.name}</p>
                      <p className="text-xs text-wood-400 truncate">{room.type}</p>
                    </div>

                    {calendarData[room.id]?.map((cell, idx) => (
                      <div
                        key={idx}
                        className={`relative h-12 rounded-lg transition-all duration-200 ${
                          statusBgColors[cell.status]
                        } ${cell.status !== 'maintenance' ? 'cursor-pointer' : 'cursor-default'} ${
                          isToday(new Date(cell.date)) ? 'ring-2 ring-wood-400 ring-offset-1' : ''
                        }`}
                        onMouseEnter={() => setHoveredCell({ roomId: room.id, date: cell.date })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => handleCellClick(room.id, cell.date, cell.status, cell.orderId)}
                      >
                        {cell.status !== 'available' && cell.status !== 'maintenance' && (
                          <div className="absolute inset-1 flex items-center justify-center">
                            {cell.guestName && (
                              <span className={`text-xs font-medium truncate ${
                                cell.status === 'pending' ? 'text-bronze-600' : 'text-wood-700'
                              }`}>
                                {cell.guestName}
                              </span>
                            )}
                          </div>
                        )}

                        {cell.status === 'available' && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-wood-500" />
                          </div>
                        )}

                        {cell.status === 'pending' && (
                          <div className="absolute top-0.5 right-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-bronze-400"></span>
                          </div>
                        )}

                        {cell.status === 'maintenance' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-brick-500" />
                          </div>
                        )}

                        {hoveredCell?.roomId === room.id && hoveredCell?.date === cell.date && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-48 p-3 bg-white rounded-xl shadow-float border border-wood-100 animate-slide-up">
                            <p className="text-sm font-medium text-wood-800 mb-1">
                              {room.name} - {room.type}
                            </p>
                            {cell.orderId ? (
                              <>
                                <p className="text-xs text-wood-500">客人：{cell.guestName}</p>
                                <p className="text-xs text-wood-500">入住：{cell.nights} 晚</p>
                                <p className={`text-xs mt-1 ${
                                  cell.status === 'pending' ? 'text-bronze-500' : 'text-sage-500'
                                }`}>
                                  {cell.status === 'pending' ? '点击查看详情（待入住）' : '点击查看详情'}
                                </p>
                              </>
                            ) : cell.status === 'maintenance' ? (
                              <p className="text-xs text-brick-500">维修中，暂不可预订</p>
                            ) : (
                              <p className="text-xs text-wood-500">点击快速新建订单</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2">
                              <StatusBadge status={cell.status} size="sm" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOrderDetail && detailOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-wood-900/30 backdrop-blur-sm"
            onClick={() => setShowOrderDetail(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-float animate-slide-right overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-wood-100 p-5 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-serif font-semibold text-wood-800">订单详情</h3>
                <p className="text-sm text-wood-400 mt-0.5">{detailOrder.orderNo}</p>
              </div>
              <button
                onClick={() => setShowOrderDetail(false)}
                className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={detailOrder.status} />
                <span className="text-2xl font-serif font-bold text-wood-700">
                  {formatMoney(detailOrder.price)}
                </span>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wood-300 to-wood-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-wood-800">{detailOrder.guestName}</p>
                    <p className="text-sm text-wood-400">{detailOrder.guestPhone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-wood-400">身份证号</p>
                    <p className="text-wood-700 font-medium">{detailOrder.guestIdNo}</p>
                  </div>
                  <div>
                    <p className="text-wood-400">入住人数</p>
                    <p className="text-wood-700 font-medium">{detailOrder.guestCount} 人</p>
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
                    <span className="text-wood-700 font-medium">
                      {room ? `${room.name} ${room.type}` : '未知'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wood-400">入住日期</span>
                    <span className="text-wood-700 font-medium">{detailOrder.checkInDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wood-400">退房日期</span>
                    <span className="text-wood-700 font-medium">{detailOrder.checkOutDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wood-400">入住天数</span>
                    <span className="text-wood-700 font-medium">
                      {diffDays(new Date(detailOrder.checkInDate), new Date(detailOrder.checkOutDate))} 晚
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wood-400">到店时间</span>
                    <span className="text-wood-700 font-medium">{detailOrder.checkInTime || '预计 14:00'}</span>
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
                    <span className="text-wood-700 font-medium">{formatMoney(detailOrder.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wood-400">押金</span>
                    <span className="text-wood-700 font-medium">{formatMoney(detailOrder.deposit)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-wood-400">预订渠道</span>
                    <span className="text-wood-700 font-medium">{detailOrder.channel}</span>
                  </div>
                  <div className="pt-3 border-t border-wood-100 flex items-center justify-between">
                    <span className="text-wood-600 font-medium">总计</span>
                    <span className="text-xl font-serif font-bold text-wood-800">
                      {formatMoney(detailOrder.price + detailOrder.deposit)}
                    </span>
                  </div>
                </div>
              </div>

              {detailOrder.specialRequirements && (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-wood-500" />
                    <span className="text-sm font-medium text-wood-700">特殊需求</span>
                  </div>
                  <p className="text-sm text-wood-600 bg-wood-50 p-3 rounded-lg">
                    {detailOrder.specialRequirements}
                  </p>
                </div>
              )}

              {detailOrder.invoiceRemark && (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-wood-500" />
                    <span className="text-sm font-medium text-wood-700">发票备注</span>
                  </div>
                  <p className="text-sm text-wood-600 bg-wood-50 p-3 rounded-lg">
                    {detailOrder.invoiceRemark}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewOrder && room && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-wood-900/30 backdrop-blur-sm"
            onClick={() => setShowNewOrder(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-float animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-wood-100 p-5 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-lg font-serif font-semibold text-wood-800">新建订单</h3>
                <p className="text-sm text-wood-400 mt-0.5">
                  {room.name} {room.type}
                </p>
              </div>
              <button
                onClick={() => setShowNewOrder(false)}
                className="p-2 rounded-lg text-wood-400 hover:bg-wood-50 hover:text-wood-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {newOrderError && (
                <div className="flex items-center gap-2 p-3 bg-brick-400/10 border border-brick-400/30 rounded-lg text-brick-500 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {newOrderError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">客人姓名 *</label>
                  <input
                    type="text"
                    value={newOrderForm.guestName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, guestName: e.target.value })}
                    className="input-field"
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <label className="label-text">手机号 *</label>
                  <input
                    type="tel"
                    value={newOrderForm.guestPhone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, guestPhone: e.target.value })}
                    className="input-field"
                    placeholder="请输入手机号"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">身份证号</label>
                <input
                  type="text"
                  value={newOrderForm.guestIdNo}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, guestIdNo: e.target.value })}
                  className="input-field"
                  placeholder="请输入身份证号"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">入住日期 *</label>
                  <input
                    type="date"
                    value={newOrderForm.checkInDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, checkInDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">退房日期 *</label>
                  <input
                    type="date"
                    value={newOrderForm.checkOutDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, checkOutDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label-text">入住人数</label>
                  <input
                    type="number"
                    min={1}
                    value={newOrderForm.guestCount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, guestCount: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">房费 (¥)</label>
                  <input
                    type="number"
                    min={0}
                    value={newOrderForm.price}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">押金 (¥)</label>
                  <input
                    type="number"
                    min={0}
                    value={newOrderForm.deposit}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, deposit: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">预订渠道</label>
                <select
                  value={newOrderForm.channel}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, channel: e.target.value })}
                  className="input-field"
                >
                  <option value="携程">携程</option>
                  <option value="美团">美团</option>
                  <option value="飞猪">飞猪</option>
                  <option value="Booking">Booking</option>
                  <option value="直接预订">直接预订</option>
                </select>
              </div>

              <div>
                <label className="label-text">特殊需求</label>
                <textarea
                  value={newOrderForm.specialRequirements}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, specialRequirements: e.target.value })}
                  placeholder="例如：需要高楼层、安静、婴儿床等"
                  className="input-field min-h-[80px]"
                />
              </div>

              <div>
                <label className="label-text">发票备注</label>
                <textarea
                  value={newOrderForm.invoiceRemark}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, invoiceRemark: e.target.value })}
                  placeholder="发票抬头、税号等信息"
                  className="input-field min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewOrder(false)}
                  className="flex-1 py-3 border border-wood-200 text-wood-600 rounded-xl font-medium hover:bg-wood-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 py-3 bg-sage-400 text-white rounded-xl font-medium hover:bg-sage-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  创建订单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
