"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Label } from "./label"
import { Button } from "../../journal/ui/button2"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Calendar } from "./calendar"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  minDate: Date
  maxDate: Date
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  return (
   <div className="flex flex-col sm:flex-row gap-4">
         <div className="grid gap-2">
           <Label htmlFor="start-date">Start Date</Label>
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 id="start-date"
                 variant={"outline"}
                 className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {startDate ? format(startDate, "MMMM d, yyyy") : <span>Pick a date</span>}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="start">
               <Calendar
                 mode="single"
                 selected={startDate}
                 onSelect={onStartDateChange}
                 initialFocus
                 fromDate={minDate}
                 toDate={maxDate}
               />
             </PopoverContent>
           </Popover>
         </div>
         <div className="grid gap-2">
           <Label htmlFor="end-date">End Date</Label>
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 id="end-date"
                 variant={"outline"}
                 className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {endDate ? format(endDate, "MMMM d, yyyy") : <span>Pick a date</span>}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="end">
               <Calendar
                 mode="single"
                 selected={endDate}
                 onSelect={onEndDateChange}
                 initialFocus
                 fromDate={startDate || minDate}
                 toDate={maxDate}
               />
             </PopoverContent>
           </Popover>
         </div>
         {(startDate || endDate) && (
           <Button
             variant="ghost"
             className="h-10 px-3 mt-auto"
             onClick={() => {
               onStartDateChange(undefined)
               onEndDateChange(undefined)
             }}
           >
             Reset
           </Button>
         )}
       </div>
  )
}