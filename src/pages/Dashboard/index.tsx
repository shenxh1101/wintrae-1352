import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, Eye } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import StatusBadge from '@/components/StatusBadge';
import DataCard from '@/components/DataCard';
import { useAppStore } from '@/store/useAppStore';
import { CalendarCellData, RoomStatusType } from '@/types';
import { formatDate, addDays, isToday, getWeekDates, isSameDay } from '@/utils/date';
import { Users, BedDouble, Wrench, Sparkles } from 'lucide-react';

const statusColors: Record<RoomStatusType, string> = {
  occupied: 'bg-sage-400',
  checkout: 'bg-coral-400',
  available: 'bg-mist-300',
  maintenance: 'bg-brick-400',
};

const statusBgColors: Record<RoomStatusType, string> = {
  occupied: 'bg-sage-400/10 hover:bg-sage-400/20',
  checkout: 'bg-coral-400/10 hover:bg-coral-400/20',
  available: 'bg-mist-300/20 hover:bg-mist-300/40',
  maintenance: 'bg-brick-400/10 hover:bg-brick-400/20',
};

export default function Dashboard() {
  const { rooms, orders } = useAppStore();
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<RoomStatusType | 'all'>('all');
  const [hoveredCell, setHoveredCell] = useState<{ roomId: string; date: string } | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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
            status = 'occupied';
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
    let occupied = 0;
    let checkout = 0;
    let available = 0;
    let maintenance = 0;

    rooms.forEach((room) => {
      const todayCell = calendarData[room.id]?.find((c) => c.date === todayStr);
      if (todayCell) {
        switch (todayCell.status) {
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

    return { occupied, checkout, available, maintenance, total: rooms.length };
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

  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <Layout title="房态看板" subtitle="实时掌握所有房间状态">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="flex items-center gap-3">
                {(['occupied', 'checkout', 'available', 'maintenance'] as RoomStatusType[]).map((s) => (
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
              <button className="flex items-center gap-2 px-4 py-2 btn-primary">
                <Plus className="w-4 h-4" />
                新建订单
              </button>
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
                        className={`relative h-12 rounded-lg cursor-pointer transition-all duration-200 ${
                          statusBgColors[cell.status]
                        } ${isToday(new Date(cell.date)) ? 'ring-2 ring-wood-400 ring-offset-1' : ''}`}
                        onMouseEnter={() => setHoveredCell({ roomId: room.id, date: cell.date })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => cell.orderId && setShowOrderModal(true)}
                      >
                        {cell.status !== 'available' && cell.status !== 'maintenance' && (
                          <div className="absolute inset-1 flex items-center justify-center">
                            {cell.guestName && (
                              <span className="text-xs font-medium text-wood-700 truncate">
                                {cell.guestName}
                              </span>
                            )}
                          </div>
                        )}

                        {cell.status === 'maintenance' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-brick-500" />
                          </div>
                        )}

                        {hoveredCell?.roomId === room.id && hoveredCell?.date === cell.date && cell.orderId && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-48 p-3 bg-white rounded-xl shadow-float border border-wood-100 animate-slide-up">
                            <p className="text-sm font-medium text-wood-800 mb-1">{room.name} - {room.type}</p>
                            <p className="text-xs text-wood-500">客人：{cell.guestName}</p>
                            <p className="text-xs text-wood-500">入住：{cell.nights} 晚</p>
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
    </Layout>
  );
}
