
import { Employee, ContractTypeKuwait } from '../types';

export const sampleEmployees: Employee[] = [
  { 
    id: 'emp-001', 
    employeeId: 'EMP001',
    fullNameAr: 'أحمد محمود مبارك', 
    basicSalary: 850.000,
    jobTitle: 'محاسب أول',
    department: 'المالية',
    joiningDate: '2020-01-15',
    civilId: '290010101234',
    nationality: 'كويتي',
    status: 'Active',
    contractType: ContractTypeKuwait.LIMITED
  },
  { 
    id: 'emp-002', 
    employeeId: 'EMP002',
    fullNameAr: 'فاطمة علي حسين السيد', 
    basicSalary: 1200.000,
    jobTitle: 'مهندس تنفيذ',
    department: 'المشاريع',
    joiningDate: '2018-05-20',
    civilId: '288050505678',
    nationality: 'كويتية',
    status: 'Active',
    contractType: ContractTypeKuwait.UNLIMITED
  },
  { 
    id: 'emp-003', 
    employeeId: 'EMP003',
    fullNameAr: 'جاسم محمد العوضي', 
    basicSalary: 950.000,
    jobTitle: 'محلل بيانات',
    department: 'نظم المعلومات',
    joiningDate: '2021-03-10',
    civilId: '292031001567',
    nationality: 'كويتي',
    status: 'Active',
    contractType: ContractTypeKuwait.LIMITED
  }
];
