
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Case, AdminTask, Hearing, AdminTaskStatus } from '../types';
import { initialCases } from '../data/caseData';
import { initialMockTasks } from '../data/taskData';
import { notificationService } from '../services/notificationService';

interface CaseTaskContextType {
  cases: Case[];
  tasks: AdminTask[];
  hearings: Hearing[];
  updateHearingStatus: (hearingId: string, newStatus: Hearing['status']) => void;
  updateTaskStatus: (taskId: string, newStatus: AdminTaskStatus) => void;
  addTask: (task: AdminTask) => void;
  updateTask: (task: AdminTask) => void;
  deleteTask: (taskId: string) => void;
  setTasks: React.Dispatch<React.SetStateAction<AdminTask[]>>;
  addHearing: (hearing: Hearing) => void;
  updateHearing: (hearing: Hearing) => void;
  deleteHearing: (hearingId: string) => void;
}

const CaseTaskContext = createContext<CaseTaskContextType | undefined>(undefined);

// Generate initial hearings from cases
const generateInitialHearings = (cases: Case[]): Hearing[] => {
  const hearings: Hearing[] = [];
  cases.forEach(c => {
    if (c.hearings) {
      c.hearings.forEach(h => {
        hearings.push({
          ...h,
          caseId: c.id,
          caseTitle: c.title,
          clientName: c.clientName,
          assignedLawyer: c.assignedLawyer
        } as Hearing);
      });
    }
  });
  return hearings;
};

export const CaseTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [tasks, setTasks] = useState<AdminTask[]>(initialMockTasks);
  const [hearings, setHearings] = useState<Hearing[]>(generateInitialHearings(initialCases));

  const runAutomationRules = useCallback((trigger: { type: 'HEARING_COMPLETED'; caseId: string }) => {
    if (trigger.type === 'HEARING_COMPLETED') {
        const affectedCases = cases.filter(c => c.id === trigger.caseId);
        const caseTitle = affectedCases.length > 0 ? affectedCases[0].title : trigger.caseId;
        
        notificationService.addNotification({
            title: 'تم تفعيل الأتمتة',
            message: `تم تحديث المهام المرتبطة بالقضية (${caseTitle}) إلى "قيد المراجعة" بعد اكتمال الجلسة.`,
            category: 'INFORMATIONAL',
            priority: 'NORMAL',
            relatedId: trigger.caseId
        });

      setTasks(prevTasks => prevTasks.map(task => {
        if (task.relatedCaseId === trigger.caseId && task.status !== AdminTaskStatus.COMPLETED) {
          return {
            ...task,
            status: AdminTaskStatus.PENDING_REVIEW,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return task;
      }));
    }
  }, [cases]);

  const updateHearingStatus = useCallback((hearingId: string, newStatus: Hearing['status']) => {
    setHearings(prev => prev.map(h => {
      if (h.id === hearingId) {
        const updated = { ...h, status: newStatus };
        if (newStatus === 'Completed' && h.caseId) {
          runAutomationRules({ type: 'HEARING_COMPLETED', caseId: h.caseId });
        }
        return updated;
      }
      return h;
    }));
  }, [runAutomationRules]);

  const addHearing = useCallback((hearing: Hearing) => {
    setHearings(prev => [hearing, ...prev]);
  }, []);

  const updateHearing = useCallback((hearing: Hearing) => {
    setHearings(prev => prev.map(h => h.id === hearing.id ? hearing : h));
  }, []);

  const deleteHearing = useCallback((hearingId: string) => {
    setHearings(prev => prev.filter(h => h.id !== hearingId));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: AdminTaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : t));
  }, []);

  const addTask = useCallback((task: AdminTask) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateTask = useCallback((task: AdminTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const value = useMemo(() => ({
    cases,
    tasks,
    hearings,
    updateHearingStatus,
    updateTaskStatus,
    addTask,
    updateTask,
    deleteTask,
    setTasks,
    addHearing,
    updateHearing,
    deleteHearing
  }), [cases, tasks, hearings, updateHearingStatus, updateTaskStatus, addTask, updateTask, deleteTask, addHearing, updateHearing, deleteHearing]);

  return (
    <CaseTaskContext.Provider value={value}>
      {children}
    </CaseTaskContext.Provider>
  );
};

export const useCaseTask = () => {
  const context = useContext(CaseTaskContext);
  if (context === undefined) {
    throw new Error('useCaseTask must be used within a CaseTaskProvider');
  }
  return context;
};
