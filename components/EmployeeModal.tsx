
import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { X, Save } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Employee) => void;
  initialData?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('شعبة الفنون والمسرح');
  const [annualBalance, setAnnualBalance] = useState<number>(30);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setId(initialData.id);
      setRole(initialData.role);
      setDepartment(initialData.department);
      setAnnualBalance(initialData.annualBalance);
    } else {
      setName('');
      setId('');
      setRole('');
      setDepartment('شعبة الفنون والمسرح');
      setAnnualBalance(30);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id,
      name,
      role,
      department,
      annualBalance,
      usage: initialData ? initialData.usage : { Annual: 0, Sick: 0, Hourly: 0, Unpaid: 0 }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'تعديل بيانات' : 'إضافة منتسب'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full text-slate-600">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">الاسم</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">الرقم الوظيفي</label>
            <input type="text" required value={id} onChange={(e) => setId(e.target.value)} disabled={!!initialData} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none disabled:bg-slate-100" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 mb-1">الرصيد</label>
               <input type="number" required min="0" value={annualBalance} onChange={(e) => setAnnualBalance(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
            </div>
            <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 mb-1">الصفة</label>
               <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 mt-2"
          >
            حفظ
          </button>
        </form>
      </div>
    </div>
  );
};
