
import { Employee, LeaveRequest, LeaveType } from "./types";

export const MOCK_EMPLOYEES_LIST: Employee[] = [
  {
    id: "12637",
    name: "وسام عبد السلام جلوب",
    role: "مسؤول شعبة",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "13385",
    name: "سلام محمد عبد الرسول",
    role: "مسؤول وحدة",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "134",
    name: "علي حسين عبيد",
    role: "مسؤول وحدة",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "27857",
    name: "حسين كاظم علي",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "17117",
    name: "عبد الله عباس امين",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "22198",
    name: "ليث حامد كاظم",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "1818",
    name: "حسين علي عباس",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "15195",
    name: "حسنين حميد حسين",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "14146",
    name: "عقيل شاكر حسون",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "237",
    name: "مثنى عبد علي شلش",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "28010",
    name: "سجاد حسين مهدي",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "32761",
    name: "علي ستار بزون",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "30508",
    name: "حسن حسين شهيد",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "25279",
    name: "عباس علي هادي",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
  {
    id: "12616",
    name: "اياد عبد علي كريم",
    role: "منتسب",
    department: "شعبة الفنون والمسرح",
    annualBalance: 30,
    usage: { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 },
  },
];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  Annual: "سنوية (أيام)",
  Sick: "مرضية (أيام)",
  Unpaid: "بدون راتب (أيام)",
  Hourly: "زمنية (ساعات)",
};

export const LEAVE_COLORS: Record<LeaveType, string> = {
  Annual: "text-blue-600 bg-blue-100",
  Sick: "text-emerald-600 bg-emerald-100",
  Unpaid: "text-slate-600 bg-slate-100",
  Hourly: "text-purple-600 bg-purple-100",
};
