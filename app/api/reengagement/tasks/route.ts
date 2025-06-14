import { NextResponse } from 'next/server';

interface ReEngagementTask {
  task_id: string;
  description: string;
  lead_id?: string;
  lead_name?: string;
  assigned_to_user_id?: string;
  assigned_to_name?: string;
  due_date: string; // ISO date string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Mock data store
let mockTasks: ReEngagementTask[] = [
  { task_id: 'task_001', description: 'Draft personalized email for Cold Lead Segment A', lead_name: 'Segment A (Cold Leads)', assigned_to_name: 'Marketing Team', due_date: '2023-11-10T23:59:59Z', status: 'completed', priority: 'high', created_at: '2023-11-08T10:00:00Z', updated_at: '2023-11-10T14:00:00Z' },
  { task_id: 'task_002', description: 'Follow-up call with Jane Doe (Warm Lead)', lead_id: 'lead_jane_doe', lead_name: 'Jane Doe', assigned_to_user_id: 'user_alice', assigned_to_name: 'Sales Rep Alice', due_date: '2023-11-12T17:00:00Z', status: 'open', priority: 'high', created_at: '2023-11-09T11:00:00Z', updated_at: '2023-11-09T11:00:00Z' },
  { task_id: 'task_003', description: 'Review engagement metrics for Campaign X (Re-engagement)', lead_name: 'Campaign X Metrics', assigned_to_name: 'Analyst Bob', due_date: '2023-11-14T17:00:00Z', status: 'in_progress', priority: 'medium', created_at: '2023-11-10T09:30:00Z', updated_at: '2023-11-11T10:00:00Z' },
  { task_id: 'task_004', description: 'Send special offer to recently re-engaged leads group', lead_name: 'Re-engaged Group 1', assigned_to_name: 'Marketing Automation', due_date: '2023-11-08T23:59:59Z', status: 'overdue', priority: 'medium', created_at: '2023-11-05T15:00:00Z', updated_at: '2023-11-05T15:00:00Z' },
  { task_id: 'task_005', description: 'Prepare content for new re-engagement email sequence (Q1)', assigned_to_name: 'Content Team', due_date: '2023-11-20T17:00:00Z', status: 'open', priority: 'low', created_at: '2023-11-11T16:00:00Z', updated_at: '2023-11-11T16:00:00Z' },
];

const validStatuses: ReEngagementTask['status'][] = ['open', 'in_progress', 'completed', 'cancelled', 'overdue'];
const validPriorities: ReEngagementTask['priority'][] = ['high', 'medium', 'low'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') as ReEngagementTask['status'] | null;
  const priorityFilter = searchParams.get('priority') as ReEngagementTask['priority'] | null;

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredTasks = mockTasks;

    // Update overdue tasks before filtering
    const now = new Date();
    filteredTasks.forEach(task => {
        if ((task.status === 'open' || task.status === 'in_progress') && new Date(task.due_date) < now) {
            task.status = 'overdue';
        }
    });

    if (statusFilter && validStatuses.includes(statusFilter)) {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    if (priorityFilter && validPriorities.includes(priorityFilter)) {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    return NextResponse.json({ data: filteredTasks });
  } catch (error) {
    console.error("Error fetching re-engagement tasks:", error);
    return NextResponse.json({ error: { message: "Error fetching re-engagement tasks" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newTaskData = await request.json() as Omit<ReEngagementTask, 'task_id' | 'created_at' | 'updated_at'>;

    // Basic validation
    if (!newTaskData.description || typeof newTaskData.description !== 'string' || newTaskData.description.trim() === '') {
        return NextResponse.json({ error: { message: "Task description is required." } }, { status: 400 });
    }
    if (!newTaskData.due_date || isNaN(new Date(newTaskData.due_date).getTime())) {
        return NextResponse.json({ error: { message: "Valid due_date is required." } }, { status: 400 });
    }
    if (!newTaskData.status || !validStatuses.includes(newTaskData.status)) {
        return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } }, { status: 400 });
    }
    if (!newTaskData.priority || !validPriorities.includes(newTaskData.priority)) {
        return NextResponse.json({ error: { message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` } }, { status: 400 });
    }

    const newTask: ReEngagementTask = {
      ...newTaskData,
      task_id: `task_${String(Date.now()).slice(-6)}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating re-engagement task:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating re-engagement task" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: { message: "Task ID is required for update" } }, { status: 400 });
    }

    const updates = await request.json() as Partial<Omit<ReEngagementTask, 'task_id' | 'created_at'>>;

    // Basic validation for updates
    if (updates.status && !validStatuses.includes(updates.status)) {
        return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } }, { status: 400 });
    }
    if (updates.priority && !validPriorities.includes(updates.priority)) {
        return NextResponse.json({ error: { message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` } }, { status: 400 });
    }
    if (updates.due_date && isNaN(new Date(updates.due_date).getTime())) {
        return NextResponse.json({ error: { message: "Invalid due_date." } }, { status: 400 });
    }


    const taskIndex = mockTasks.findIndex(t => t.task_id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json({ error: { message: "Task not found" } }, { status: 404 });
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ data: mockTasks[taskIndex] });
  } catch (error) {
    console.error("Error updating re-engagement task:", error);
     if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating re-engagement task" } }, { status: 500 });
  }
}
