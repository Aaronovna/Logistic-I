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
        $reports = AuditReport::with(['audit_task', 'audit_task.assignedToUser', 'audit_task.assignedByUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($selectedReport) {
                $report = $selectedReport->toArray();

                $report['task_title'] = $selectedReport->audit_task->title ?? 'N/A';
                $report['task_scope'] = $selectedReport->audit_task->scope ?? 'N/A';
                $report['task_type'] = $selectedReport->audit_task->type ?? 'N/A';
                $report['task_status'] = $selectedReport->audit_task->status ?? 'N/A';
                $report['task_description'] = $selectedReport->audit_task->description ?? 'N/A';
                $report['task_startdate'] = $selectedReport->audit_task->startdate ?? 'N/A';
                $report['task_deadline'] = $selectedReport->audit_task->deadline ?? 'N/A';
                $report['task_assigned_to'] = $selectedReport->audit_task->assigned_to ?? 'N/A';
                $report['task_assigned_by'] = $selectedReport->audit_task->assigned_by ?? 'N/A';
                $report['task_assigned_to_name'] = $selectedReport->audit_task->assignedToUser->name ?? 'N/A';
                $report['task_assigned_by_name'] = $selectedReport->audit_task->assignedByUser->name ?? 'N/A';
                $report['task_priority'] = $selectedReport->audit_task->priority ?? 'N/A';

                unset($report['audit_task']);

                return $report;
            });

        return response()->json(['data' => $reports], 200);
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

        $report = AuditReport::create($validatedData);

        return response()->json(['message' => 'Report created successfully.', 'data' => $report,], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $selectedReport = AuditReport::with(['audit_task', 'audit_task.assignedToUser', 'audit_task.assignedByUser'])->find($id);

        if (!$selectedReport) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $report = $selectedReport->toArray();

        $report['task_title'] = $selectedReport->audit_task->title ?? 'N/A';
        $report['task_scope'] = $selectedReport->audit_task->scope ?? 'N/A';
        $report['task_type'] = $selectedReport->audit_task->type ?? 'N/A';
        $report['task_status'] = $selectedReport->audit_task->status ?? 'N/A';
        $report['task_description'] = $selectedReport->audit_task->description ?? 'N/A';
        $report['task_startdate'] = $selectedReport->audit_task->startdate ?? 'N/A';
        $report['task_deadline'] = $selectedReport->audit_task->deadline ?? 'N/A';
        $report['task_assigned_to'] = $selectedReport->audit_task->assigned_to ?? 'N/A';
        $report['task_assigned_by'] = $selectedReport->audit_task->assigned_by ?? 'N/A';
        $report['task_assigned_to_name'] = $selectedReport->audit_task->assignedToUser->name ?? 'N/A';
        $report['task_assigned_by_name'] = $selectedReport->audit_task->assignedByUser->name ?? 'N/A';
        $report['task_priority'] = $selectedReport->audit_task->priority ?? 'N/A';

        return response()->json(['data' => $report], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $report = AuditReport::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $validatedData = $request->validate([
            'review_status' => 'sometimes|string',
            'reviewed_by' => 'sometimes|exists:users,id',
        ]);

        $report->update($validatedData);

        return response()->json(['message' => 'Report updated successfully', 'task' => $report], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $report = AuditReport::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully'], 200);
    }

    public function showByTask(string $taskId)
    {
        $report = AuditReport::where('task_id', $taskId)->first();

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        return response()->json(['data' => $report], 200);
    }
}
