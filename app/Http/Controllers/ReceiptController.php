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
        $orders = Receipt::with(['audit_task', 'audit_task.assignedToUser','audit_task.auditReport','warehouse'])->orderBy('created_at', 'desc')->get();

        // Append the assigned user names to each task
        $orders->each(function ($order) {
            $order->task_status = $order->audit_task->status ?? 'N/A';
            $order->task_report_final_comment = $order->audit_task->auditReport->final_comment ?? 'N/A';
            $order->task_assigned_to_name = $order->audit_task->assignedToUser->name ?? 'N/A';
            $order->order_warehouse = $order->warehouse->name ?? 'N/A';
        });

        return response()->json($orders);
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
        try {
            // Create the record
            $order = Receipt::create($validatedData);

            return response()->json([
                'message' => 'order created successfully',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
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
        $validatedData = $request->validate([
            'status' => 'sometimes|string',
            'task_id' => 'sometimes|exists:audit_tasks,id'
        ]);

        // Find the category by its ID
        $receipt = Receipt::findOrFail($id);

        $receipt->fill($validatedData);
        $receipt->save();

        // Return a success response
        return response()->json([
            'message' => 'Updated successfully',
            'task' => $receipt
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
