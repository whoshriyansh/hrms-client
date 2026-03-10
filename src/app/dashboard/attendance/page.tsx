"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarCheck,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  attendanceService,
  type GetAttendanceParams,
} from "@/lib/services/attendance.service";
import { userService } from "@/lib/services/user.service";
import { MarkAttendanceModal } from "@/components/dashboard/mark-attendance-modal";

const DEPARTMENTS = [
  { value: "HR", label: "HR" },
  { value: "Engineering", label: "Engineering" },
  { value: "Sales", label: "Sales" },
  { value: "Marketing", label: "Marketing" },
  { value: "Finance", label: "Finance" },
  { value: "Support", label: "Support" },
];

interface AttendanceRecord {
  _id: string;
  userId: string;
  date: string;
  status: "present" | "absent";
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    employeeId: string;
    department: string;
  };
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalAttendances: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: string;
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);

  // User search for mark attendance
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Modals
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceRecord | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit form
  const [editStatus, setEditStatus] = useState<"present" | "absent">("present");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAttendances = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GetAttendanceParams = { page, limit: 10 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (statusFilter) params.status = statusFilter as "present" | "absent";
      if (dateFrom) params.dateFrom = dateFrom.toISOString();
      if (dateTo) params.dateTo = dateTo.toISOString();

      const response = await attendanceService.getAll(params);

      if (response.success) {
        setAttendances(response.data.attendances);
        setPagination(response.data.pagination);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Failed to fetch attendance records",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, department, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Search users for mark attendance
  useEffect(() => {
    const searchUsers = async () => {
      if (!userSearch.trim()) {
        setUsers([]);
        return;
      }

      setUserSearchLoading(true);
      try {
        const response = await userService.getAll({
          search: userSearch,
          limit: 5,
        });
        if (response.success) {
          setUsers(response.data.users);
        }
      } catch {
        console.error("Error searching users");
      } finally {
        setUserSearchLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

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

  const selectUserForAttendance = (user: User) => {
    setSelectedUser(user);
    setMarkAttendanceOpen(true);
    setUserSearch("");
    setUsers([]);
    setShowUserDropdown(false);
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setStatusFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const hasFilters = search || department || statusFilter || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage employee attendance
          </p>
        </div>
        {/* User search dropdown for marking attendance */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employee to mark..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setShowUserDropdown(true);
                }}
                onFocus={() => setShowUserDropdown(true)}
                className="pl-9 w-64"
              />
              {/* User dropdown */}
              {showUserDropdown && (userSearch || users.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {userSearchLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner className="w-4 h-4" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      {userSearch
                        ? "No employees found"
                        : "Type to search employees"}
                    </div>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => selectUserForAttendance(user)}
                        className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate text-sm">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.employeeId} • {user.department}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Click outside to close */}
          {showUserDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(!dateFrom && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PP") : "From"}
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
              {dateTo ? format(dateTo, "PP") : "To"}
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
        {hasFilters && (
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Error loading attendance</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={fetchAttendances}>
              Try again
            </Button>
          </Empty>
        </div>
      ) : attendances.length === 0 ? (
        <Empty className="border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarCheck className="w-5 h-5" />
            </EmptyMedia>
            <EmptyTitle>No attendance records</EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? "No records match your filter criteria"
                : "Start by marking attendance for employees"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-xl border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Employee</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Department
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium shrink-0">
                          {record.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {record.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {record.user.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {record.user.department}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {format(new Date(record.date), "PP")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(record.date), "EEEE")}
                        </p>
                      </div>
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
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/users/${record.userId}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
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

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        open={markAttendanceOpen}
        onOpenChange={setMarkAttendanceOpen}
        user={selectedUser}
        onSuccess={() => {
          toast.success("Attendance marked successfully");
          fetchAttendances();
          setSelectedUser(null);
        }}
      />

      {/* Edit Attendance Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Update the attendance status for{" "}
              {selectedAttendance?.user.fullName} on{" "}
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
              {selectedAttendance?.user.fullName} on{" "}
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
