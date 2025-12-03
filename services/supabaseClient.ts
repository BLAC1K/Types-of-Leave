
import { createClient } from '@supabase/supabase-js';
import { Employee, LeaveRequest } from '../types';

// Credentials provided by the user
const supabaseUrl = 'https://qiphazzakvcfonihwlae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcGhhenpha3ZjZm9uaWh3bGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTYyNzAsImV4cCI6MjA4MDIzMjI3MH0.vIdWyF4M5nQG3Ld7I7hGgzLfPFwRNGkbWHrHlYBZ_DM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- API Helpers ---

// Fetch all employees
export const fetchEmployeesAPI = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*');
  
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data as Employee[];
};

// Upsert (Insert or Update) an employee
export const upsertEmployeeAPI = async (employee: Employee) => {
  const { error } = await supabase
    .from('employees')
    .upsert(employee);
  
  if (error) console.error('Error upserting employee:', error);
  return error;
};

// Bulk insert employees (for initialization)
export const bulkInsertEmployeesAPI = async (employees: Employee[]) => {
  const { error } = await supabase
    .from('employees')
    .insert(employees);
  
  if (error) console.error('Error bulk inserting employees:', error);
  return error;
};

// Fetch all leaves
export const fetchLeavesAPI = async (): Promise<LeaveRequest[]> => {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('createdAt', { ascending: false }); // Newest first

  if (error) {
    console.error('Error fetching leaves:', error);
    return [];
  }
  return data as LeaveRequest[];
};

// Insert a new leave
export const insertLeaveAPI = async (leave: LeaveRequest) => {
  // Ensure we send plain objects and match column names if they differ, 
  // but based on our setup, keys match DB columns.
  const { error } = await supabase
    .from('leaves')
    .insert(leave);

  if (error) console.error('Error inserting leave:', error);
  return error;
};

// Delete a leave
export const deleteLeaveAPI = async (leaveId: string) => {
  const { error } = await supabase
    .from('leaves')
    .delete()
    .eq('id', leaveId);

  if (error) console.error('Error deleting leave:', error);
  return error;
};
