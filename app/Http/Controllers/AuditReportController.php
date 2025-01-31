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
        $reports = AuditReport::with('audit_task')->get();

        // Map the data to include the total stock per product across all warehouses
        $reports = $reports->map(function ($report) {

            return [
                'id' => $report->id,
                'location' => $report->location,
                'details' => $report->details,
                'final_comment' => $report->final_comment,
                'review_status' => $report->review_status,
                'reviewed_by' => $report->reviewed_by,
                'review_notes' => $report->review_notes,
                'files' => $report->files,

                'task_id' => $report->task_id,
                'task_title' => $report->audit_task->title ?? 'N/A',
                'task_type' => $report->audit_task->type ?? 'N/A',
                'task_description' => $report->audit_task->description ?? 'N/A',
                'task_assigned_to' => $report->audit_task->assigned_to ?? 'N/A',
                'task_assigned_by' => $report->audit_task->assigned_by ?? 'N/A',
            ];
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
        //
    }

    public function showByTask($taskId)
    {
        $report = AuditReport::where('task_id', $taskId)->firstOrFail();

        return response()->json($report);
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
        //
    }
}
