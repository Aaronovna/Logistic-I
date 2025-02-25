<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Receipt::with(['audit_task.assignedToUser', 'audit_task.auditReport', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $receipt = $order->toArray();

                $receipt['task_status'] = $order->audit_task->status ?? 'N/A';
                $receipt['task_report_final_comment'] = $order->audit_task->auditReport->final_comment ?? 'N/A';
                $receipt['task_assigned_to_name'] = $order->audit_task->assignedToUser->name ?? 'N/A';
                $receipt['order_warehouse'] = $order->warehouse->name ?? 'N/A';

                unset($receipt['audit_task'], $receipt['warehouse']);

                return $receipt;
            });

        return response()->json(['data' => $orders], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer',
            'status' => 'required|string|max:255',
            'products' => 'required|json',
            'supplier' => 'required|json',
            'fleet' => 'required|string|max:255',
            'order_date' => 'required|date_format:Y-m-d H:i:s',
            'warehouse_id' => 'required|exists:infrastructures,id',
            'accepted' => 'required|boolean',
        ]);

        $receipt = Receipt::create($validatedData);

        return response()->json(['message' => 'Receipt created successfully', 'data' => $receipt], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = Receipt::with(['audit_task.assignedToUser', 'audit_task.auditReport', 'warehouse'])
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        $receipt = $order->toArray();

        $receipt['task_status'] = $order->audit_task->status ?? 'N/A';
        $receipt['task_report_final_comment'] = $order->audit_task->auditReport->final_comment ?? 'N/A';
        $receipt['task_assigned_to_name'] = $order->audit_task->assignedToUser->name ?? 'N/A';
        $receipt['order_warehouse'] = $order->warehouse->name ?? 'N/A';

        unset($receipt['audit_task'], $receipt['warehouse']);

        return response()->json(['data' => $receipt], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $receipt = Receipt::find($id);

        if (!$receipt) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        $validatedData = $request->validate([
            'status' => 'sometimes|string',
            'task_id' => 'sometimes|exists:audit_tasks,id'
        ]);

        $receipt->update($validatedData);

        return response()->json(['message' => 'Category updated successfully', 'data' => $receipt], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $receipt = Receipt::find($id);

        if (!$receipt) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        $receipt->delete();

        return response()->json(['message' => 'Receipt deleted successfully'], 200);
    }
}
