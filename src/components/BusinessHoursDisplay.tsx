import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    slots: Array<{ start: string; end: string }>;
  };
}

interface BusinessHoursDisplayProps {
  openingHours: OpeningHours;
  className?: string;
  compact?: boolean;
}

const BusinessHoursDisplay = ({ openingHours, className = "", compact = false }: BusinessHoursDisplayProps) => {
  const daysOfWeek = [
    { key: 'monday', label: 'Seg', fullLabel: 'Segunda-feira' },
    { key: 'tuesday', label: 'Ter', fullLabel: 'Terça-feira' },
    { key: 'wednesday', label: 'Qua', fullLabel: 'Quarta-feira' },
    { key: 'thursday', label: 'Qui', fullLabel: 'Quinta-feira' },
    { key: 'friday', label: 'Sex', fullLabel: 'Sexta-feira' },
    { key: 'saturday', label: 'Sáb', fullLabel: 'Sábado' },
    { key: 'sunday', label: 'Dom', fullLabel: 'Domingo' }
  ];

  const getCurrentDayKey = () => {
    const today = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[today];
  };

  const isCurrentlyOpen = () => {
    const currentDay = getCurrentDayKey();
    const currentTime = new Date();
    const currentTimeStr = currentTime.toTimeString().slice(0, 5);
    
    const dayData = openingHours[currentDay];
    if (!dayData?.isOpen) return false;
    
    return dayData.slots.some(slot => 
      currentTimeStr >= slot.start && currentTimeStr <= slot.end
    );
  };

  const formatTimeSlots = (slots: Array<{ start: string; end: string }>) => {
    return slots.map(slot => `${slot.start} - ${slot.end}`).join(', ');
  };

  const getTodayStatus = () => {
    const currentDay = getCurrentDayKey();
    const dayData = openingHours[currentDay];
    
    if (!dayData?.isOpen) return "Fechado hoje";
    
    if (isCurrentlyOpen()) {
      return "Aberto agora";
    } else {
      const nextSlot = dayData.slots.find(slot => {
        const currentTimeStr = new Date().toTimeString().slice(0, 5);
        return currentTimeStr < slot.start;
      });
      
      if (nextSlot) {
        return `Abre às ${nextSlot.start}`;
      } else {
        return "Fechado hoje";
      }
    }
  };

  if (!openingHours || Object.keys(openingHours).length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          Horário de funcionamento não informado
        </p>
      </div>
    );
  }

  if (compact) {
    const status = getTodayStatus();
    const isOpen = isCurrentlyOpen();
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="h-4 w-4" />
        <Badge variant={isOpen ? "default" : "secondary"} className="text-xs">
          {status}
        </Badge>
      </div>
    );
  }

  const currentDay = getCurrentDayKey();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Horário de Funcionamento
        </h4>
        <Badge variant={isCurrentlyOpen() ? "default" : "secondary"}>
          {getTodayStatus()}
        </Badge>
      </div>
      
      <div className="space-y-1">
        {daysOfWeek.map(({ key, label, fullLabel }) => {
          const dayData = openingHours[key];
          const isToday = key === currentDay;
          
          return (
            <div 
              key={key} 
              className={`flex justify-between text-sm ${
                isToday ? 'font-medium bg-muted/50 rounded px-2 py-1' : ''
              }`}
            >
              <span className={isToday ? 'text-primary' : 'text-muted-foreground'}>
                {fullLabel}:
              </span>
              <span className={isToday ? 'text-primary' : ''}>
                {dayData?.isOpen && dayData.slots.length > 0 
                  ? formatTimeSlots(dayData.slots)
                  : 'Fechado'
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessHoursDisplay;