import { Task, Hearing, ExecutionAction, ExpertAction, ExecutionActionStatus } from '../types';

/**
 * Automates status updates for related entities based on a trigger entity's status change.
 */
export const statusAutomationService = {
    /**
     * When a hearing status changes, update related tasks or case state.
     */
    handleHearingStatusChange: (hearing: Hearing, tasks: Task[]): Task[] => {
        if (hearing.status === 'Completed') {
            // Rule: If a hearing is 'Completed', related tasks for this case should be set to 'Pending Review' 
            // (Mapping 'Pending Review' to a similar available status in Task if needed, 
            // but let's assume we might need to add 'Pending Review' to Task status or just use 'In Progress')
            
            return tasks.map(task => {
                if (task.relatedCaseId === hearing.caseId && task.status === 'Pending') {
                    return { ...task, status: 'In Progress' }; // Simulating 'Pending Review' via 'In Progress'
                }
                return task;
            });
        }
        return tasks;
    },

    /**
     * When an execution action is completed.
     */
    handleExecutionStatusChange: (action: ExecutionAction, tasks: Task[]): Task[] => {
        if (action.status === ExecutionActionStatus.COMPLETED) {
            // Rule: If execution is completed, notify via a new task or update existing ones
            return tasks.map(task => {
                // Logic for related tasks
                return task;
            });
        }
        return tasks;
    }
};
