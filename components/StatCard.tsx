
import React from 'react';
import { LeaveType } from '../types';
import { LEAVE_TYPE_LABELS } from '../constants';

interface StatCardProps {
  type: LeaveType;
  used: number;
  colorClass: string;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ type, used, colorClass, icon }) => {
  const isHourly = type === 'Hourly';
  const unit = isHourly ? 'ساعة' : 'يوم';

  return (
    <div className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <div className={`p-2 md:p-3 rounded-full ${colorClass} bg-opacity-10 text-opacity-100 mb-2`}>
        {icon}
      </div>
      <h3 className="text-xl md:text-3xl font-bold text-slate-800 mb-1">{used}</h3>
      <div className="text-[10px] md:text-sm text-slate-500 font-medium">
         {LEAVE_TYPE_LABELS[type]}
      </div>
    </div>
  );
};
