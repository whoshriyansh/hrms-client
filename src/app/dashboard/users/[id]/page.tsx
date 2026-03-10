"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building2,
  Hash,
  Calendar as CalendarIcon,
  AlertCircle,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
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
import { userService } from "@/lib/services/user.service";
import {
  attendanceService,
  type GetUserAttendanceParams,
} from "@/lib/services/attendance.service";
import { MarkAttendanceModal } from "@/components/dashboard/mark-attendance-modal";

interface User {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    employeeId: string;
    department: string;
  };
  date: string;
  status: "present" | "absent";
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalAttendances: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceRecord | null>(null);

  // Edit form
  const [editStatus, setEditStatus] = useState<"present" | "absent">("present");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await userService.getById(userId);
      if (response.success) {
        setUser(response.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch user");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchAttendances = useCallback(async () => {
    setAttendanceLoading(true);

    try {
      const params: GetUserAttendanceParams = { page, limit: 10 };
      if (dateFrom) params.dateFrom = dateFrom.toISOString();
      if (dateTo) params.dateTo = dateTo.toISOString();
      if (statusFilter) params.status = statusFilter as "present" | "absent";

      const response = await attendanceService.getByUserId(userId, params);

      if (response.success) {
        setAttendances(response.data.attendances);
        setPagination(response.data.pagination);
      }
    } catch (err: unknown) {
      console.error("Error fetching attendances:", err);
    } finally {
      setAttendanceLoading(false);
    }
  }, [userId, page, dateFrom, dateTo, statusFilter]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const handleUpdateAttendance = async () => {
    if (!selectedAttendance) return;

    setIsUpdating(true);

    try {
      const response = await attendanceService.update(selectedAttendance._id, {
        status: editStatus,
      });

      if (response.success) {
        toast.success("Attendance updated successfully");
        setEditModalOpen(false);
        setSelectedAttendance(null);
        fetchAttendances();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Failed to update attendance",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAttendance = async () => {
    if (!selectedAttendance) return;

    setIsDeleting(true);

    try {
      const response = await attendanceService.delete(selectedAttendance._id);

      if (response.success) {
        toast.success("Attendance record deleted");
        setDeleteModalOpen(false);
        setSelectedAttendance(null);
        fetchAttendances();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Failed to delete attendance",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setEditStatus(attendance.status);
    setEditModalOpen(true);
  };

  const openDeleteModal = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatusFilter("");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>User not found</EmptyTitle>
            <EmptyDescription>
              {error || "The user you're looking for doesn't exist"}
            </EmptyDescription>
          </EmptyHeader>
          <Link href="/dashboard/users">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {user.fullName}
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <Button onClick={() => setMarkAttendanceOpen(true)}>
          <CalendarCheck className="w-4 h-4 mr-1.5" />
          Mark Attendance
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <Hash className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employee ID</p>
                <p className="font-medium">{user.employeeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium">{user.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {format(new Date(user.createdAt), "PP")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Attendance History</CardTitle>
              <CardDescription>
                View and manage attendance records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(!dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date);
                    setPage(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(!dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date);
                    setPage(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-7 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
            {(dateFrom || dateTo || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Attendance Table */}
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-6 h-6" />
            </div>
          ) : attendances.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarCheck className="w-5 h-5" />
                </EmptyMedia>
                <EmptyTitle>No attendance records</EmptyTitle>
                <EmptyDescription>
                  {dateFrom || dateTo || statusFilter
                    ? "No records match your filter criteria"
                    : "Start by marking attendance for this employee"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Recorded At
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.date), "PP")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(record.date), "EEEE")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                              record.status === "present"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700",
                            )}
                          >
                            {record.status === "present" ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {format(new Date(record.createdAt), "Pp")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditModal(record)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openDeleteModal(record)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalAttendances,
                    )}{" "}
                    of {pagination.totalAttendances} records
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        open={markAttendanceOpen}
        onOpenChange={setMarkAttendanceOpen}
        user={user}
        onSuccess={() => {
          toast.success("Attendance marked successfully");
          fetchAttendances();
        }}
      />

      {/* Edit Attendance Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Update the attendance status for{" "}
              {selectedAttendance &&
                format(new Date(selectedAttendance.date), "PPP")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Status</label>
            <div className="flex gap-3">
              <label
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                  editStatus === "present"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-input hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="editStatus"
                  value="present"
                  checked={editStatus === "present"}
                  onChange={() => setEditStatus("present")}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Present</span>
              </label>
              <label
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                  editStatus === "absent"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-input hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="editStatus"
                  value="absent"
                  checked={editStatus === "absent"}
                  onChange={() => setEditStatus("absent")}
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
            <Button onClick={handleUpdateAttendance} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the attendance record for{" "}
              {selectedAttendance &&
                format(new Date(selectedAttendance.date), "PPP")}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteAttendance}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
