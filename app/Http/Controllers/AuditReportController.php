<?php

namespace App\Http\Controllers;

use App\Models\AuditReport;
use Illuminate\Http\Request;

class AuditReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reports = AuditReport::with(['audit_task', 'audit_task.assignedToUser', 'audit_task.assignedByUser'])->orderBy('created_at', 'desc')->get();

        // Append the assigned user names to each task
        $reports->each(function ($report) {
            $report->task_title = $report->audit_task->title ?? 'N/A';
            $report->task_scope = $report->audit_task->scope ?? 'N/A';
            $report->task_type = $report->audit_task->type ?? 'N/A';
            $report->task_status = $report->audit_task->status ?? 'N/A';
            $report->task_description = $report->audit_task->description ?? 'N/A';
            $report->task_startdate = $report->audit_task->startdate ?? 'N/A';
            $report->task_deadline = $report->audit_task->deadline ?? 'N/A';
            $report->task_assigned_to = $report->audit_task->assigned_to ?? 'N/A';
            $report->task_assigned_by = $report->audit_task->assigned_by ?? 'N/A';
            $report->task_assigned_to_name = $report->audit_task->assignedToUser->name ?? 'N/A';
            $report->task_assigned_by_name = $report->audit_task->assignedByUser->name ?? 'N/A';
        });

        return response()->json($reports);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'location' => 'required|string',
            'details' => 'required|string',
            'final_comment' => 'required|string',
            'review_status' => 'required|string',
            'task_id' => 'required|exists:audit_tasks,id',
            'files' => 'required|json'
        ]);

        // Create the new DispatchMaterial
        $report = AuditReport::create($validatedData);

        return response()->json([
            'message' => 'Report created successfully.',
            'data' => $report,
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $report = AuditReport::with(['audit_task', 'audit_task.assignedToUser', 'audit_task.assignedByUser'])->find($id);

        if (!$report) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $report->task_title = $report->audit_task->title ?? 'N/A';
        $report->task_scope = $report->audit_task->scope ?? 'N/A';
        $report->task_type = $report->audit_task->type ?? 'N/A';
        $report->task_status = $report->audit_task->status ?? 'N/A';
        $report->task_description = $report->audit_task->description ?? 'N/A';
        $report->task_startdate = $report->audit_task->startdate ?? 'N/A';
        $report->task_deadline = $report->audit_task->deadline ?? 'N/A';
        $report->task_assigned_to = $report->audit_task->assigned_to ?? 'N/A';
        $report->task_assigned_by = $report->audit_task->assigned_by ?? 'N/A';
        $report->task_assigned_to_name = $report->audit_task->assignedToUser->name ?? 'N/A';
        $report->task_assigned_by_name = $report->audit_task->assignedByUser->name ?? 'N/A';
        $report->task_created_at = $report->audit_task->created_at ?? 'N/A';

        return response()->json($report);
    }

    public function showByTask($taskId)
    {
        $report = AuditReport::where('task_id', $taskId)->first(); // This will return null if no report is found

        // If no report is found, return a 404 response with a message
        if (!$report) {
            return response()->json(['message' => 'Report not found'], status: 201);
        }

        return response()->json($report);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'review_status' => 'sometimes|string',
            'reviewed_by' => 'sometimes|exists:users,id',
        ]);

        // Find the category by its ID
        $report = AuditReport::findOrFail($id);

        $report->fill($validatedData);
        $report->save();

        // Return a success response
        return response()->json([
            'message' => 'Updated successfully',
            'task' => $report
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
