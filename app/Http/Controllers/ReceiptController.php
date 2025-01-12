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
        $orders = Receipt::all();
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
            'supplier_id' => 'required|integer',
            'fleet' => 'required|string|max:255',
            'order_date' => 'required|date_format:Y-m-d H:i:s',
            'destination' => 'required|string|max:255',
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
