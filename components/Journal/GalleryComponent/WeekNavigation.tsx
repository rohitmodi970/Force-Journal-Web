import React from "react";

interface WeekNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  selectedDate,
  onDateChange
}) => {
  // Get the start of the week (Sunday)
  const startOfTheWeek = new Date(selectedDate);
  startOfTheWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  // Generate an array of the 7 days of the week
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(startOfTheWeek);
    day.setDate(startOfTheWeek.getDate() + index);
    
    const isActive = day.getDate() === selectedDate.getDate() && 
                     day.getMonth() === selectedDate.getMonth() && 
                     day.getFullYear() === selectedDate.getFullYear();
    
    return {
      date: day,
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: day.getDate(),
      isActive
    };
  });

  const formatDateRange = () => {
    const startDay = startOfTheWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endDay = new Date(startOfTheWeek);
    endDay.setDate(startOfTheWeek.getDate() + 6);
    const endDayFormatted = endDay.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${startDay} - ${endDayFormatted}`;
  };

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-500 mb-2">
        {formatDateRange()}
      </div>
      <div className="flex justify-between space-x-2 overflow-x-auto">
        {weekDays.map((day) => (
          <button
            key={day.date.toString()}
            onClick={() => onDateChange(day.date)}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-md ${
              day.isActive 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="text-xs">{day.dayName}</div>
            <div className={`text-lg ${day.isActive ? 'font-medium' : ''}`}>{day.dayNumber}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekNavigation;