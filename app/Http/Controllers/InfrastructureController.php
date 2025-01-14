<?php

namespace App\Http\Controllers;

use App\Models\Infrastructure;
use Illuminate\Http\Request;

class InfrastructureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $infrastructures = Infrastructure::all();
        return response()->json($infrastructures);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'type' => 'required|integer',
            'name' => 'required|string|max:500',
            'address' => 'required|string|max:500',
            'image_url' => 'required|string|max:500',
            'access' => 'required|json',
        ]);
        try {
            // Create the record
            $order = Infrastructure::create($validatedData);

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
        $infrastructure = Infrastructure::findOrFail($id);

    if (!$infrastructure) {
        return response()->json(['message' => 'Product not found.'], 404);
    }

    return response()->json($infrastructure);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request = $request->validate([
            'type' => 'required|integer',
            'name' => 'required|string|max:500',
            'address' => 'required|string|max:500',
            'image_url' => 'required|string|max:500',
            'access' => 'required|json',
        ]);

        $infrastructure = Infrastructure::findOrFail($id);

        $infrastructure->update($request);

        return response()->json([
            'message' => 'Infrastructure updated successfully',
            'infrastructure' => $infrastructure
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
