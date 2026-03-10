"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { attendanceService } from "@/lib/services/attendance.service";

interface User {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: string;
}

interface MarkAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function MarkAttendanceModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: MarkAttendanceModalProps) {
  const [status, setStatus] = useState<"present" | "absent">("present");
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await attendanceService.mark({
        userId: user._id,
        status,
        date: date.toISOString(),
      });

      if (response.success) {
        onOpenChange(false);
        onSuccess?.();
        // Reset form
        setStatus("present");
        setDate(new Date());
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            {user && (
              <>
                Mark attendance for{" "}
                <span className="font-medium text-foreground">
                  {user.fullName}
                </span>{" "}
                ({user.employeeId})
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Date <span className="text-destructive">*</span>
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate || new Date());
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Status <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3">
              <label
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                  status === "present"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-input hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value="present"
                  checked={status === "present"}
                  onChange={() => setStatus("present")}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Present</span>
              </label>
              <label
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                  status === "absent"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-input hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value="absent"
                  checked={status === "absent"}
                  onChange={() => setStatus("absent")}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Absent</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Marking...
                </>
              ) : (
                "Mark Attendance"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
