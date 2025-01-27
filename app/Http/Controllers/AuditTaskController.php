<?php

namespace App\Http\Controllers;

use App\Models\AuditTask;
use Illuminate\Http\Request;

class AuditTaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = AuditTask::all();
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
            'description' => 'required|string',
        ]);

        // Create the new DispatchMaterial
        $dispatchMaterial = AuditTask::create($validatedData);

        return response()->json([
            'message' => 'Task created successfully.',
            'data' => $dispatchMaterial,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
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
