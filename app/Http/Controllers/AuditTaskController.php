<?php

namespace App\Http\Controllers;

use App\Models\AuditTask;
use Illuminate\Http\Request;
use App\Models\User;

class AuditTaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = AuditTask::with(['assignedToUser', 'assignedByUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($selectedTask) {
                $task = $selectedTask->toArray();

                $task['assigned_to_name'] = $selectedTask->assignedToUser->name ?? 'N/A';
                $task['assigned_by_name'] = $selectedTask->assignedByUser->name ?? 'N/A';

                unset($task['assigned_by_user'], $task['assigned_to_user']);

                return $task;
            });

        return response()->json(['data' => $tasks], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'scope' => 'required|string',
            'startdate' => 'required|date_format:Y-m-d H:i:s',
            'deadline' => 'required|date_format:Y-m-d H:i:s',
            'description' => 'required|string',
            'assigned_by' => 'required|exists:users,id'
        ]);

        $task = AuditTask::create($validatedData);

        return response()->json(['message' => 'Task created successfully.', 'data' => $task,], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $selectedTask = AuditTask::with(['assignedToUser', 'assignedByUser'])->find($id);

        if (!$selectedTask) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $task = $selectedTask->toArray();

        $task['assigned_to_name'] = $selectedTask->assignedToUser->name ?? 'N/A';
        $task['assigned_by_name'] = $selectedTask->assignedByUser->name ?? 'N/A';

        unset($task['assigned_by_user'], $task['assigned_to_user']);

        return response()->json(['data' => $task], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $task = AuditTask::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $validatedData = $request->validate([
            'assigned_to' => 'sometimes|exists:users,id',
            'status' => 'sometimes|string',
        ]);

        $task->update($validatedData);

        return response()->json(['message' => 'Task updated successfully', 'data' => $task], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = AuditTask::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully'], 200);
    }

    public function indexByUser(string $userId)
    {
        if (!User::find($userId)) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $tasks = AuditTask::where('assigned_to', $userId)
            ->with(['assignedToUser', 'assignedByUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($selectedTask) {
                $task = $selectedTask->toArray();

                $task['assigned_to_name'] = $selectedTask->assignedToUser->name ?? 'N/A';
                $task['assigned_by_name'] = $selectedTask->assignedByUser->name ?? 'N/A';

                unset($task['assigned_by_user'], $task['assigned_to_user']);

                return $task;
            });

        return response()->json(['data' => $tasks], 200);
    }
}
