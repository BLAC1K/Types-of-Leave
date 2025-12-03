
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, FileBarChart, Settings, Plus, Sun, Briefcase, HeartPulse, Clock, Search, Calendar, Printer, Download, ChevronUp, ChevronDown, Filter, XCircle, Trash2, CloudCheck, Loader2, Home, User, FileText, Menu } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import { MOCK_EMPLOYEES_LIST, LEAVE_TYPE_LABELS, LEAVE_COLORS } from './constants';
import { LeaveRequest, Employee } from './types';
import { StatCard } from './components/StatCard';
import { RequestModal } from './components/RequestModal';
import { EmployeeModal } from './components/EmployeeModal';
import { ChatWidget } from './components/ChatWidget';
import { 
  fetchEmployeesAPI, 
  fetchLeavesAPI, 
  insertLeaveAPI, 
  deleteLeaveAPI, 
  upsertEmployeeAPI, 
  bulkInsertEmployeesAPI 
} from './services/supabaseClient';

function App() {
  // --- State Initialization ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        let fetchedEmployees = await fetchEmployeesAPI();
        if (fetchedEmployees.length === 0) {
          await bulkInsertEmployeesAPI(MOCK_EMPLOYEES_LIST);
          fetchedEmployees = MOCK_EMPLOYEES_LIST;
        }
        setEmployees(fetchedEmployees);
        const fetchedLeaves = await fetchLeavesAPI();
        setLeaves(fetchedLeaves);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Modal States
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportDate, setReportDate] = useState(new Date());

  // Filter & Sort States
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee, direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    department: '',
    balanceRange: ''
  });

  // --- Helpers ---
  const calculateDuration = (start: string, end?: string) => {
    if (!start) return 0;
    if (!end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // --- Filter & Sort Logic ---
  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);
  const uniqueRoles = Array.from(new Set(employees.map(e => e.role))).filter(Boolean);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(filters.search.toLowerCase()) || 
      emp.id.includes(filters.search);
    const matchesRole = filters.role ? emp.role === filters.role : true;
    const matchesDept = filters.department ? emp.department === filters.department : true;
    let matchesBalance = true;
    if (filters.balanceRange === 'low') matchesBalance = emp.annualBalance < 5;
    else if (filters.balanceRange === 'medium') matchesBalance = emp.annualBalance >= 5 && emp.annualBalance <= 15;
    else if (filters.balanceRange === 'high') matchesBalance = emp.annualBalance > 15;
    return matchesSearch && matchesRole && matchesDept && matchesBalance;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (key === 'annualBalance') {
       return direction === 'asc' ? a.annualBalance - b.annualBalance : b.annualBalance - a.annualBalance;
    }
    const valA = String(a[key] || '');
    const valB = String(b[key] || '');
    return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const handleSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => setFilters({ search: '', role: '', department: '', balanceRange: '' });

  const getFilteredLeaves = () => {
    return leaves.filter(leave => {
      const leaveDate = new Date(leave.date);
      return leaveDate.getMonth() === reportDate.getMonth() && 
             leaveDate.getFullYear() === reportDate.getFullYear();
    });
  };

  // --- Handlers ---
  const handleAddLeave = async (newLeave: Omit<LeaveRequest, 'id' | 'createdAt'>) => {
    setIsSyncing(true);
    const leaveRequest: LeaveRequest = {
      ...newLeave,
      id: `L${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      await insertLeaveAPI(leaveRequest);
      setLeaves([leaveRequest, ...leaves]);
      if (newLeave.type === 'Annual') {
        const duration = calculateDuration(newLeave.date, newLeave.endDate);
        const employee = employees.find(e => e.id === newLeave.employeeId);
        if (employee) {
          const updatedEmployee = {
            ...employee,
            annualBalance: Math.max(0, employee.annualBalance - duration)
          };
          await upsertEmployeeAPI(updatedEmployee);
          setEmployees(prev => prev.map(emp => emp.id === newLeave.employeeId ? updatedEmployee : emp));
        }
      }
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    const leaveToDelete = leaves.find(l => l.id === leaveId);
    if (!leaveToDelete) return;
    if (window.confirm('حذف السجل نهائياً؟ سيتم استرجاع الرصيد في حال كانت الإجازة سنوية.')) {
      setIsSyncing(true);
      try {
        await deleteLeaveAPI(leaveId);
        if (leaveToDelete.type === 'Annual') {
          const duration = calculateDuration(leaveToDelete.date, leaveToDelete.endDate);
          const employee = employees.find(e => e.id === leaveToDelete.employeeId);
          if (employee) {
            const updatedEmployee = { ...employee, annualBalance: employee.annualBalance + duration };
            await upsertEmployeeAPI(updatedEmployee);
            setEmployees(prev => prev.map(emp => emp.id === leaveToDelete.employeeId ? updatedEmployee : emp));
          }
        }
        setLeaves(prev => prev.filter(l => l.id !== leaveId));
      } catch (error) {
        alert("حدث خطأ أثناء الحذف");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    setIsSyncing(true);
    try {
      await upsertEmployeeAPI(updatedEmp);
      setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
      setIsEmployeeModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const data = getFilteredLeaves();
    const headers = ['الاسم', 'نوع الإجازة', 'تاريخ البدء', 'المدة', 'ملاحظات'];
    const rows = data.map(leave => {
      const emp = employees.find(e => e.id === leave.employeeId);
      const isHourly = leave.type === 'Hourly';
      const duration = isHourly ? `${leave.hours} ساعات` : `${calculateDuration(leave.date, leave.endDate)} يوم`;
      return [`"${emp?.name}"`, `"${LEAVE_TYPE_LABELS[leave.type]}"`, leave.date, `"${duration}"`, `"${leave.reason}"`].join(',');
    });
    const csv = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_${reportDate.toISOString().slice(0,7)}.csv`;
    link.click();
  };

  // --- Statistics ---
  const totalAnnual = leaves.filter(l => l.type === 'Annual').reduce((acc, l) => acc + calculateDuration(l.date, l.endDate), 0);
  const totalSick = leaves.filter(l => l.type === 'Sick').reduce((acc, l) => acc + calculateDuration(l.date, l.endDate), 0);
  const totalHourly = leaves.filter(l => l.type === 'Hourly').reduce((acc, l) => acc + (l.hours || 0), 0);
  const totalUnpaid = leaves.filter(l => l.type === 'Unpaid').reduce((acc, l) => acc + calculateDuration(l.date, l.endDate), 0);

  const chartData = [
    { name: 'سنوية', value: totalAnnual, color: '#3b82f6' },
    { name: 'مرضية', value: totalSick, color: '#10b981' },
    { name: 'زمنية', value: totalHourly, color: '#9333ea' },
    { name: 'بدون راتب', value: totalUnpaid, color: '#64748b' },
  ];

  const reportLeaves = getFilteredLeaves();
  const currentMonthValue = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
  
  const inventoryData = employees.map(emp => {
    const empLeaves = reportLeaves.filter(l => l.employeeId === emp.id);
    return {
      ...emp,
      reportStats: {
        Annual: empLeaves.filter(l => l.type === 'Annual').reduce((acc, l) => acc + calculateDuration(l.date, l.endDate), 0),
        Sick: empLeaves.filter(l => l.type === 'Sick').reduce((acc, l) => acc + calculateDuration(l.date, l.endDate), 0),
        Unpaid: empLeaves.filter(l => l.type === 'Unpaid').reduce((acc, l) => acc + calculateDuration(l.date, l.endDate), 0),
        Hourly: empLeaves.filter(l => l.type === 'Hourly').reduce((acc, l) => acc + (l.hours || 0), 0),
      }
    };
  });

  if (isLoading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 mb-2" /> <span className="text-slate-500 text-sm">جاري التحميل...</span></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0 md:flex">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l h-screen fixed right-0 z-20 overflow-y-auto no-print">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><FileText size={16} /></div>
          <h1 className="font-bold text-slate-800">أرشيف الإجازات</h1>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
            { id: 'employees', label: 'المنتسبين', icon: Users },
            { id: 'reports', label: 'الجرد والتقارير', icon: FileBarChart },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:mr-64 p-4 md:p-8 max-w-5xl mx-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 no-print">
           <h2 className="text-xl font-bold text-slate-800">
             {activeTab === 'dashboard' && 'الرئيسية'}
             {activeTab === 'employees' && 'المنتسبين'}
             {activeTab === 'reports' && 'التقارير'}
             {activeTab === 'settings' && 'الإعدادات'}
           </h2>
           <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
             {employees.length}
           </div>
        </div>

        {isSyncing && (
           <div className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs animate-pulse no-print">
             <Loader2 size={12} className="animate-spin" /> <span>حفظ...</span>
           </div>
        )}

        {/* Floating Action Button (Mobile) */}
        {activeTab !== 'settings' && (
          <button 
            onClick={() => setIsLeaveModalOpen(true)}
            className="md:hidden fixed left-4 bottom-20 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center hover:scale-105 transition-transform no-print"
          >
            <Plus size={28} />
          </button>
        )}

        {/* Desktop Header Action */}
        {activeTab !== 'settings' && (
          <div className="hidden md:flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم</h2>
             <button onClick={() => setIsLeaveModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors text-sm">
               <Plus size={18} /> أرشفة إجازة
             </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards (Compact Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 no-print">
              <StatCard type="Annual" used={totalAnnual} colorClass="text-blue-600 bg-blue-50" icon={<Sun size={20} />} />
              <StatCard type="Sick" used={totalSick} colorClass="text-emerald-600 bg-emerald-50" icon={<HeartPulse size={20} />} />
              <StatCard type="Hourly" used={totalHourly} colorClass="text-purple-600 bg-purple-50" icon={<Clock size={20} />} />
              <StatCard type="Unpaid" used={totalUnpaid} colorClass="text-slate-600 bg-slate-50" icon={<Briefcase size={20} />} />
            </div>

            {/* Recent Activity List (Mobile Friendly) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <h3 className="font-bold text-slate-800 mb-4 text-sm md:text-base">أحدث الإجازات</h3>
              <div className="space-y-3">
                {leaves.slice(0, 5).map(leave => {
                   const emp = employees.find(e => e.id === leave.employeeId);
                   const isHourly = leave.type === 'Hourly';
                   return (
                     <div key={leave.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${LEAVE_COLORS[leave.type].split(' ')[1]} ${LEAVE_COLORS[leave.type].split(' ')[0]}`}>
                              {leave.type === 'Annual' ? <Sun size={14} /> : leave.type === 'Sick' ? <HeartPulse size={14} /> : leave.type === 'Hourly' ? <Clock size={14} /> : <Briefcase size={14} />}
                           </div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-slate-800 text-sm truncate">{emp?.name}</p>
                              <p className="text-xs text-slate-500">{leave.date}</p>
                           </div>
                        </div>
                        <button onClick={() => handleDeleteLeave(leave.id)} className="text-red-400 p-2"><Trash2 size={16}/></button>
                     </div>
                   );
                })}
              </div>
            </div>
            
            {/* Chart (Hidden on small mobile if needed, or simplified) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-64 no-print hidden md:block">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Legend iconType="circle" />
                  </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="animate-in fade-in duration-300 space-y-4">
            {/* Search Bar */}
            <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-10 no-print">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={filters.search}
                  onChange={e => setFilters({...filters, search: e.target.value})}
                  placeholder="بحث..." 
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 shadow-sm text-sm"
                />
              </div>
              {/* Simple Filter Toggle could go here */}
            </div>

            {/* Mobile Cards List */}
            <div className="md:hidden space-y-3">
              {sortedEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{emp.name}</h3>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                       {emp.annualBalance} يوم
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                     <span className="text-xs text-slate-400">#{emp.id}</span>
                     <button onClick={() => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} className="text-blue-600 text-xs font-bold px-3 py-1 bg-blue-50 rounded-lg">
                       تعديل
                     </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4">الاسم</th>
                      <th className="px-6 py-4">القسم</th>
                      <th className="px-6 py-4">الرصيد</th>
                      <th className="px-6 py-4">تعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold">{emp.name}</td>
                        <td className="px-6 py-4 text-slate-500">{emp.department}</td>
                        <td className="px-6 py-4 text-blue-600 font-bold">{emp.annualBalance}</td>
                        <td className="px-6 py-4">
                           <button onClick={() => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Pencil size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div id="printable-area" className="animate-in fade-in duration-300 space-y-4">
             {/* Controls */}
             <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between no-print">
               <input 
                  type="month" 
                  value={currentMonthValue} 
                  onChange={e => { if(e.target.value) { const [y, m] = e.target.value.split('-'); setReportDate(new Date(Number(y), Number(m)-1)); } }}
                  className="bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-700 outline-none" 
               />
               <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Download size={18}/></button>
                  <button onClick={handlePrint} className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Printer size={18}/></button>
               </div>
             </div>

             {/* Print Header */}
             <div className="hidden print:block text-center mb-6 pb-4 border-b">
               <h2 className="text-xl font-bold">تقرير الإجازات - {reportDate.toLocaleDateString('ar-EG', {month: 'long'})}</h2>
             </div>

             {/* Summary Cards (Mobile) */}
             <div className="md:hidden space-y-3 no-print">
                {inventoryData.map(emp => {
                   const hasLeaves = Object.values(emp.reportStats).some(v => v > 0);
                   if (!hasLeaves) return null;
                   return (
                     <div key={emp.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-sm mb-2">{emp.name}</h3>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                           <div className="bg-blue-50 p-1 rounded">
                             <div className="text-blue-600 font-bold">{emp.reportStats.Annual}</div>
                             <div className="text-[10px] text-blue-400">سنوية</div>
                           </div>
                           <div className="bg-emerald-50 p-1 rounded">
                             <div className="text-emerald-600 font-bold">{emp.reportStats.Sick}</div>
                             <div className="text-[10px] text-emerald-400">مرضية</div>
                           </div>
                           <div className="bg-purple-50 p-1 rounded">
                             <div className="text-purple-600 font-bold">{emp.reportStats.Hourly}</div>
                             <div className="text-[10px] text-purple-400">ساعية</div>
                           </div>
                           <div className="bg-slate-50 p-1 rounded">
                             <div className="text-slate-600 font-bold">{emp.reportStats.Unpaid}</div>
                             <div className="text-[10px] text-slate-400">بدون</div>
                           </div>
                        </div>
                     </div>
                   );
                })}
             </div>

             {/* Detailed Log Table (Desktop & Print) */}
             <div className="hidden md:block print:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-right">
                   <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">الاسم</th>
                        <th className="px-4 py-3">النوع</th>
                        <th className="px-4 py-3">التاريخ</th>
                        <th className="px-4 py-3">المدة</th>
                        <th className="px-4 py-3 no-print">حذف</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {reportLeaves.map(leave => {
                        const emp = employees.find(e => e.id === leave.employeeId);
                        const isHourly = leave.type === 'Hourly';
                        return (
                          <tr key={leave.id}>
                             <td className="px-4 py-3 font-bold">{emp?.name}</td>
                             <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${LEAVE_COLORS[leave.type]}`}>{LEAVE_TYPE_LABELS[leave.type]}</span></td>
                             <td className="px-4 py-3 font-mono text-xs">{leave.date}</td>
                             <td className="px-4 py-3 font-bold">{isHourly ? leave.hours + ' ساعة' : calculateDuration(leave.date, leave.endDate) + ' يوم'}</td>
                             <td className="px-4 py-3 no-print"><button onClick={() => handleDeleteLeave(leave.id)} className="text-red-400"><Trash2 size={16}/></button></td>
                          </tr>
                        )
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
                <CloudCheck className="mx-auto text-emerald-500 mb-3" size={40} />
                <h3 className="font-bold text-slate-800">حالة النظام</h3>
                <p className="text-sm text-emerald-600 mt-1">متصل بقاعدة البيانات السحابية</p>
             </div>
             <div className="text-center text-xs text-slate-400 mt-8">
               نسخة الموبايل 1.0
             </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] no-print">
         {[
           { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
           { id: 'employees', label: 'المنتسبين', icon: Users },
           { id: 'reports', label: 'التقارير', icon: FileBarChart },
           { id: 'settings', label: 'الإعدادات', icon: Settings },
         ].map(item => (
           <button 
             key={item.id} 
             onClick={() => setActiveTab(item.id)} 
             className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
           >
             <item.icon size={20} className={activeTab === item.id ? 'fill-blue-200' : ''} />
             <span className="text-[10px] font-medium">{item.label}</span>
           </button>
         ))}
      </nav>

      {/* Modals */}
      <RequestModal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)} 
        onSubmit={handleAddLeave}
        employees={employees}
      />
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }}
        onSubmit={handleUpdateEmployee}
        initialData={editingEmployee}
      />
      
      {/* Hidden Desktop Chat Widget (Can be enabled if needed, hidden for simplicity on mobile) */}
      <div className="hidden md:block">
        <ChatWidget employee={employees[0]} leaves={leaves} />
      </div>
    </div>
  );
}

// Helper icon component
const Pencil = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

export default App;
