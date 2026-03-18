"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  showTime?: boolean;
  timeInterval?: number; // minutes
  dateFormat?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  minDate,
  maxDate,
  className = '',
  showTime = false,
  timeInterval = 15,
  dateFormat = 'dd/MM/yyyy',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize time from value
  useEffect(() => {
    if (value && showTime) {
      setSelectedTime(formatTime(value));
    }
  }, [value, showTime]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update current month when value changes
  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    }
  }, [value]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return dateFormat
      .replace(/dd/g, day)
      .replace(/MM/g, month)
      .replace(/yyyy/g, year);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseTime = (timeString: string): { hours: number; minutes: number } | null => {
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return { hours, minutes };
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;

    let finalDate = date;

    if (showTime && selectedTime) {
      const time = parseTime(selectedTime);
      if (time) {
        finalDate = new Date(date);
        finalDate.setHours(time.hours, time.minutes, 0, 0);
      }
    }

    setSelectedDate(finalDate);
    onChange(finalDate);
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);

    if (selectedDate) {
      const parsedTime = parseTime(time);
      if (parsedTime) {
        const newDate = new Date(selectedDate);
        newDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
        setSelectedDate(newDate);
        onChange(newDate);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const generateTimeOptions = () => {
    const options = [];
    const totalMinutes = 24 * 60;
    for (let minutes = 0; minutes < totalMinutes; minutes += timeInterval) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
    return options;
  };

  const displayValue = selectedDate ? formatDate(selectedDate) +
    (showTime ? ` ${selectedTime || formatTime(selectedDate)}` : '') : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-glow focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <button
                key={index}
                onClick={() => date && handleDateSelect(date)}
                disabled={!date || isDateDisabled(date)}
                className={`
                  h-8 w-8 text-sm rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                  ${date && selectedDate && date.toDateString() === selectedDate.toDateString()
                    ? 'bg-cyan-glow text-black font-semibold'
                    : 'text-gray-900'
                  }
                `}
                type="button"
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>

          {/* Time picker */}
          {showTime && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Horário</span>
              </div>
              <select
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-glow focus:border-transparent"
              >
                <option value="">Selecione um horário</option>
                {generateTimeOptions().map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedTime('');
                onChange(null);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              type="button"
            >
              Limpar
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm bg-cyan-glow text-black rounded hover:bg-cyan-400"
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Date range picker
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Selecione um período',
  disabled = false,
  minDate,
  maxDate,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate || null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate || null);
  const [selectingStart, setSelectingStart] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date: Date) => {
    if (selectingStart) {
      setTempStartDate(date);
      setSelectingStart(false);
    } else {
      if (tempStartDate && date < tempStartDate) {
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
      setSelectingStart(true);
    }
  };

  const applyRange = () => {
    onChange({ start: tempStartDate, end: tempEndDate });
    setIsOpen(false);
  };

  const clearRange = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onChange({ start: null, end: null });
  };

  const displayValue = startDate && endDate
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : startDate
    ? `A partir de ${formatDate(startDate)}`
    : endDate
    ? `Até ${formatDate(endDate)}`
    : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-glow focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px]">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              {selectingStart ? 'Selecione a data inicial' : 'Selecione a data final'}
            </p>
          </div>

          {/* Simplified calendar for range selection */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              {tempStartDate && `De: ${formatDate(tempStartDate)}`}
              {tempEndDate && ` Até: ${formatDate(tempEndDate)}`}
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearRange}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              type="button"
            >
              Limpar
            </button>
            <button
              onClick={applyRange}
              className="px-3 py-1 text-sm bg-cyan-glow text-black rounded hover:bg-cyan-400"
              type="button"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}