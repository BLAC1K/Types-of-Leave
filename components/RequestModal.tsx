
import React, { useState } from 'react';
import { LeaveRequest, LeaveType, Employee } from '../types';
import { LEAVE_TYPE_LABELS } from '../constants';
import { X } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<LeaveRequest, 'id' | 'createdAt'>) => void;
  employees: Employee[];
}

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit, employees }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState<LeaveType>('Annual');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState<number>(1);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    onSubmit({ 
      employeeId, 
      type, 
      date, 
      endDate: type !== 'Hourly' ? endDate : undefined,
      hours: type === 'Hourly' ? hours : undefined,
      reason 
    });

    setEmployeeId('');
    setType('Annual');
    setDate('');
    setEndDate('');
    setHours(1);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">أرشفة إجازة</h2>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full text-slate-600">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">المنتسب</label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="">-- اختر --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">النوع</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                    type === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}
                >
                  {LEAVE_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {type === 'Hourly' ? 'التاريخ' : 'من'}
              </label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
            </div>
            
            {type === 'Hourly' ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ساعات</label>
                <input type="number" min="1" max="8" required value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">إلى</label>
                <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">ملاحظة</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            حفظ
          </button>
        </form>
      </div>
    </div>
  );
};
