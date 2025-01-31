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
        $tasks = AuditTask::with(['assignedToUser', 'assignedByUser'])->get();

        // Append the assigned user names to each task
        $tasks->each(function ($task) {
            $task->assigned_to_name = $task->assignedToUser->name ?? 'N/A';
            $task->assigned_by_name = $task->assignedByUser->name ?? 'N/A';
        });

        return response()->json($tasks);
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
            'description' => 'required|string',
            'assigned_by' => 'required|exists:users,id'
        ]);

        // Create the new DispatchMaterial
        $task = AuditTask::create($validatedData);

        return response()->json([
            'message' => 'Task created successfully.',
            'data' => $task,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $task = AuditTask::with(['assignedToUser', 'assignedByUser'])->find($id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        // Add the assigned user names
        $task->assigned_to_name = $task->assignedToUser->name ?? 'N/A';
        $task->assigned_by_name = $task->assignedByUser->name ?? 'N/A';

        return response()->json($task);
    }

    public function showUserTasks(string $userId)
    {
        // Validate the user ID (Optional: Check if the user exists)
        if (!User::find($userId)) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $tasks = AuditTask::where('assigned_to', $userId)
            ->with(['assignedToUser', 'assignedByUser'])
            ->get();

        // Append the assigned user names
        $tasks->each(function ($task) {
            $task->assigned_to_name = $task->assignedToUser->name ?? 'N/A';
            $task->assigned_by_name = $task->assignedByUser->name ?? 'N/A';
        });

        return response()->json($tasks);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'assigned_to' => 'sometimes|exists:users,id',
            'status' => 'sometimes|string',
        ]);

        // Find the category by its ID
        $task = AuditTask::findOrFail($id);

        $task->fill($validatedData);
        $task->save();

        // Return a success response
        return response()->json([
            'message' => 'Updated successfully',
            'task' => $task
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = AuditTask::find($id);

        // Check if the record exists
        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        // Delete the DispatchMaterial
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }
}
