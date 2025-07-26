export interface Todo {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    teamMembers?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    synced?: boolean;
    pendingAction?: 'create' | 'update' | 'delete';  
  }
  
  export interface ApiTodo {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    teamMembers?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    synced?: boolean;
  }
  
  export interface SyncStatus {
    isOnline: boolean
    pendingChanges: number
    syncing: boolean
  }
  