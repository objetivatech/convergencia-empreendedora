import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2 } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    slots: TimeSlot[];
  };
}

interface BusinessHoursManagerProps {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
}

const BusinessHoursManager = ({ value, onChange }: BusinessHoursManagerProps) => {
  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const defaultHours: OpeningHours = {
    monday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
    tuesday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
    wednesday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
    thursday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
    friday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
    saturday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
    sunday: { isOpen: false, slots: [] }
  };

  const currentHours = { ...defaultHours, ...value };

  const updateDay = (day: string, data: Partial<OpeningHours[string]>) => {
    const updatedHours = {
      ...currentHours,
      [day]: { ...currentHours[day], ...data }
    };
    onChange(updatedHours);
  };

  const addTimeSlot = (day: string) => {
    const dayData = currentHours[day];
    const newSlot = { start: '09:00', end: '18:00' };
    updateDay(day, {
      slots: [...dayData.slots, newSlot]
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    const dayData = currentHours[day];
    updateDay(day, {
      slots: dayData.slots.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const dayData = currentHours[day];
    const updatedSlots = dayData.slots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    updateDay(day, { slots: updatedSlots });
  };

  const copyToAllDays = (sourceDay: string) => {
    const sourceData = currentHours[sourceDay];
    const updatedHours = { ...currentHours };
    
    daysOfWeek.forEach(({ key }) => {
      if (key !== sourceDay) {
        updatedHours[key] = { ...sourceData };
      }
    });
    
    onChange(updatedHours);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Horário de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {daysOfWeek.map(({ key, label }) => {
          const dayData = currentHours[key];
          
          return (
            <div key={key} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={dayData.isOpen}
                    onCheckedChange={(checked) => 
                      updateDay(key, { 
                        isOpen: checked,
                        slots: checked ? [{ start: '09:00', end: '18:00' }] : []
                      })
                    }
                  />
                  <Label className="font-medium">{label}</Label>
                  {!dayData.isOpen && (
                    <Badge variant="secondary">Fechado</Badge>
                  )}
                </div>
                
                {dayData.isOpen && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(key)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Horário
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAllDays(key)}
                    >
                      Copiar para todos
                    </Button>
                  </div>
                )}
              </div>
              
              {dayData.isOpen && (
                <div className="space-y-2">
                  {dayData.slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(key, index, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">às</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(key, index, 'end', e.target.value)}
                        className="w-32"
                      />
                      {dayData.slots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(key, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BusinessHoursManager;