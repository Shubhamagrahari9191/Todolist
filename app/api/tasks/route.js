import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const tasks = await Task.find({ userId });

        const mappedTasks = tasks.map(t => ({
            id: t._id.toString(),
            userId: t.userId,
            title: t.title,
            subject: t.subject,
            date: t.date,
            startTime: t.startTime,
            endTime: t.endTime,
            isEvent: t.isEvent,
            status: t.status,
            progress: t.progress,
            createdAt: t.createdAt
        }));

        return NextResponse.json({ tasks: mappedTasks });
    } catch (e) {
        console.error('[API Error] GET /api/tasks:', e);
        return NextResponse.json({ error: 'Failed to fetch tasks', details: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    /* ... (rest of the file remains similar structure but needs to be provided to tool) */
    /* Wait, the tool requires the specific block or full file if replacing chunks. I will replace the whole file for safety. */
    const body = await request.json();
    const { userId, title, subject, date, startTime, endTime, isEvent } = body;

    if (!userId || !title || !date) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        await dbConnect();
        const newTask = await Task.create({
            userId,
            title,
            subject: subject || 'General',
            date,
            startTime: startTime || '09:00',
            endTime: endTime || '10:00',
            isEvent: !!isEvent,
            status: 'pending',
            progress: 0
        });

        return NextResponse.json({ task: { ...newTask.toObject(), id: newTask._id.toString() } });
    } catch (e) {
        console.error('[API Error] POST /api/tasks:', e);
        return NextResponse.json({ error: 'Failed to create task', details: e.message }, { status: 500 });
    }
}

export async function PUT(request) {
    const body = await request.json();
    const { taskId, status, title, subject, date, startTime, endTime, progress } = body;

    try {
        await dbConnect();
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (title !== undefined) updateData.title = title;
        if (subject !== undefined) updateData.subject = subject;
        if (date !== undefined) updateData.date = date;
        if (startTime !== undefined) updateData.startTime = startTime;
        if (endTime !== undefined) updateData.endTime = endTime;
        if (progress !== undefined) {
            updateData.progress = progress;
            if (progress === 100) updateData.status = 'completed';
            else if (progress > 0) updateData.status = 'in-progress';
            else updateData.status = 'pending';
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

        if (!updatedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task: { ...updatedTask.toObject(), id: updatedTask._id.toString() } });
    } catch (e) {
        console.error('[API Error] PUT /api/tasks:', e);
        return NextResponse.json({ error: 'Failed to update task', details: e.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
        return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[API Error] DELETE /api/tasks:', e);
        return NextResponse.json({ error: 'Failed to delete task', details: e.message }, { status: 500 });
    }
}
