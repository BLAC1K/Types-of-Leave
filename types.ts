
export type LeaveType = 'Annual' | 'Sick' | 'Unpaid' | 'Hourly';

export interface LeaveRequest {
  id: string;
  employeeId: string; // ربط الإجازة بالمنتسب
  type: LeaveType;
  date: string; // تاريخ الإجازة
  endDate?: string; // تاريخ الانتهاء (للإجازات اليومية)
  hours?: number; // عدد الساعات (للإجازة الزمنية)
  reason: string;
  createdAt: string;
}

export interface Employee {
  id: string; // الرقم الوظيفي
  name: string;
  role: string; // الصفة (مسؤول شعبة/وحدة/منتسب)
  department: string;
  annualBalance: number; // الرصيد السنوي المتبقي
  // الأرصدة المستهلكة
  usage: {
    [key in LeaveType]: number; // يخزن عدد الأيام أو الساعات المستخدمة
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
