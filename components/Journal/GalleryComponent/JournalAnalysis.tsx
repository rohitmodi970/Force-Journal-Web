
import React, { useState } from "react";
import { Calendar } from "@/components/ui/quilted-gallery/ui/calendar";
import { Button } from "@/components/ui/journal/ui/button2";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/quilted-gallery/ui/card";
import { BarChart2, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalAnalysisProps {
  className?: string;
}

const JournalAnalysis: React.FC<JournalAnalysisProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [analysisType, setAnalysisType] = useState<'emotions' | 'topics' | 'patterns'>('emotions');

  const handleAnalyze = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range for analysis");
      return;
    }
    
    toast.success("Analysis started! You'll be notified when it's ready.");
  };

  return (
    <Card className={cn("border border-gray-100", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-800">Journal Analysis</CardTitle>
        <CardDescription>Gain insights from your journal entries</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Type</label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={analysisType === 'emotions' ? 'default' : 'outline'} 
                onClick={() => setAnalysisType('emotions')}
                className={analysisType === 'emotions' ? 'bg-force-purple hover:bg-force-vivid-purple' : ''}
                size="sm"
              >
                Emotions
              </Button>
              <Button 
                variant={analysisType === 'topics' ? 'default' : 'outline'} 
                onClick={() => setAnalysisType('topics')}
                className={analysisType === 'topics' ? 'bg-force-purple hover:bg-force-vivid-purple' : ''}
                size="sm"
              >
                Topics
              </Button>
              <Button 
                variant={analysisType === 'patterns' ? 'default' : 'outline'} 
                onClick={() => setAnalysisType('patterns')}
                className={analysisType === 'patterns' ? 'bg-force-purple hover:bg-force-vivid-purple' : ''}
                size="sm"
              >
                Patterns
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="rounded-md border p-2">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                className="mx-auto"
              />
            </div>
          </div>
          
          <div className="bg-force-soft-purple p-3 rounded-md">
            <div className="flex items-center gap-2 text-force-purple text-sm font-medium">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {dateRange?.from && dateRange?.to ? (
                  <>
                    {dateRange.from.toLocaleDateString()} to {dateRange.to.toLocaleDateString()}
                  </>
                ) : (
                  "Select date range"
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 pt-0">
        <Button 
          onClick={handleAnalyze} 
          className="w-full bg-force-purple hover:bg-force-vivid-purple"
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          Run Analysis
        </Button>
        
        <Button 
          variant="outline"
          className="w-full"
        >
          View Past Analyses
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JournalAnalysis;
