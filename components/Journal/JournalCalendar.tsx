import React, { useState } from 'react';
import { Calendar } from '../ui/quilted-gallery/ui/calendar';
import { Button } from '../ui/journal/ui/button2';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/quilted-gallery/ui/card';
import { Badge } from '../ui/quilted-gallery/ui/badge';
import { useTheme } from '@/utilities/context/ThemeContext';
import { JournalEntry } from './types';

interface JournalCalendarProps {
  entries: JournalEntry[];
  onAnalyze: (startDate: Date, endDate: Date | null, selectedDates: Date[], analysisType: 'sentiment' | 'textual') => void;
}

type DateSelectionMode = 'range' | 'multiple';

const JournalCalendar: React.FC<JournalCalendarProps> = ({ entries, onAnalyze }) => {
  const { currentTheme, isDarkMode, elementColors } = useTheme();
  const [selectionMode, setSelectionMode] = useState<DateSelectionMode>('range');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [analysisType, setAnalysisType] = useState<'sentiment' | 'textual'>('sentiment');

  // Get all dates that have journal entries
  const datesWithEntries = entries.map(entry => {
    const [year, month, day] = entry.date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  // Custom modifiers for the calendar
  const modifiers = {
    hasEntry: datesWithEntries
  };

  // Custom modifier styles
  const modifiersStyles = {
    hasEntry: {
      color: 'white',
      backgroundColor: currentTheme.primary
    }
  };

  // Handle analysis button click
  const handleAnalyze = () => {
    if (selectionMode === 'range' && dateRange.from) {
      onAnalyze(dateRange.from, dateRange.to || dateRange.from, [], analysisType);
    } else if (selectionMode === 'multiple' && selectedDates.length > 0) {
      onAnalyze(new Date(0), null, selectedDates, analysisType);
    }
  };

  // Switch between date range and multiple dates selection
  const toggleSelectionMode = () => {
    setSelectionMode(prev => prev === 'range' ? 'multiple' : 'range');
    // Reset selections when switching modes
    setDateRange({ from: undefined, to: undefined });
    setSelectedDates([]);
  };

  // Container style based on theme
  const containerStyle = {
    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
    borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
    color: elementColors.text
  };

  return (
    <Card className="w-full transition-colors" style={containerStyle}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium" style={{ color: elementColors.text }}>
          Select Dates to Analyze
        </CardTitle>
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectionMode}
            style={{
              borderColor: currentTheme.primary,
              color: currentTheme.primary,
              backgroundColor: isDarkMode ? `${currentTheme.active}20` : `${currentTheme.light}50`
            }}
          >
            {selectionMode === 'range' ? 'Select Specific Dates' : 'Select Date Range'}
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: currentTheme.primary }}
              ></div>
              <span className="text-xs" style={{ color: elementColors.text }}>Has entries</span>
            </div>
          </div>
        </div>
        {/* Analysis Type Selection */}
        <div className="mt-4 flex gap-4 items-center">
          <span className="text-sm font-medium" style={{ color: elementColors.text }}>Analysis Type:</span>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="analysisType"
              value="sentiment"
              checked={analysisType === 'sentiment'}
              onChange={() => setAnalysisType('sentiment')}
            />
            <span>Sentiment</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="analysisType"
              value="textual"
              checked={analysisType === 'textual'}
              onChange={() => setAnalysisType('textual')}
            />
            <span>Textual</span>
          </label>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-x-auto max-w-xs mx-auto">
        {selectionMode === 'range' ? (
          <>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={range => setDateRange(range || { from: undefined, to: undefined })}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border min-w-[320px]"
              styles={{
                //@ts-ignore
                day_selected: {
                  backgroundColor: `${currentTheme.primary}80`,
                  color: isDarkMode ? '#FFFFFF' : '#FFFFFF'
                },
                day_range_middle: {
                  backgroundColor: `${currentTheme.primary}30`,
                  color: isDarkMode ? '#FFFFFF' : currentTheme.primary
                }
              }}
            />
            
            <div className="mt-4 flex items-center gap-2">
              <Badge 
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#F1F5F9',
                  color: elementColors.text
                }}
              >
                From: {dateRange.from ? dateRange.from.toLocaleDateString() : 'Not selected'}
              </Badge>
              <Badge 
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#F1F5F9',
                  color: elementColors.text
                }}
              >
                To: {dateRange.to ? dateRange.to.toLocaleDateString() : dateRange.from ? dateRange.from.toLocaleDateString() : 'Not selected'}
              </Badge>
            </div>
          </>
        ) : (
          <>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={dates => setSelectedDates(dates || [])}
              required={false}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border min-w-[320px]"
              styles={{
                //@ts-ignore
                day_selected: {
                  backgroundColor: currentTheme.primary,
                  color: isDarkMode ? '#FFFFFF' : '#FFFFFF'
                }
              }}
            />
            
            <div className="mt-4">
              <div className="mb-2 text-sm" style={{ color: elementColors.text }}>
                Selected dates: {selectedDates.length}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDates.slice(0, 3).map((date, index) => (
                  <Badge 
                    key={index}
                    style={{ 
                      backgroundColor: isDarkMode ? '#374151' : '#F1F5F9',
                      color: elementColors.text
                    }}
                  >
                    {date.toLocaleDateString()}
                  </Badge>
                ))}
                {selectedDates.length > 3 && (
                  <Badge 
                    style={{ 
                      backgroundColor: isDarkMode ? '#374151' : '#F1F5F9',
                      color: elementColors.text
                    }}
                  >
                    +{selectedDates.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
        
        <Button 
          className="w-full mt-4"
          onClick={handleAnalyze}
          disabled={(selectionMode === 'range' && !dateRange.from) || 
                   (selectionMode === 'multiple' && selectedDates.length === 0)}
          style={{
            backgroundColor: currentTheme.primary,
            color: '#FFFFFF',
            opacity: ((selectionMode === 'range' && !dateRange.from) || 
                     (selectionMode === 'multiple' && selectedDates.length === 0)) ? 0.5 : 1
          }}
        >
          Analyze Journal Entries
        </Button>
      </CardContent>
    </Card>
  );
};

export default JournalCalendar;