<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DispatchMaterial;

class DispatchMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retrieve all DispatchMaterials
        $dispatchMaterials = DispatchMaterial::all();

        return response()->json([
            'message' => 'All dispatch materials retrieved successfully.',
            'data' => $dispatchMaterials,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'request_id' => 'required|exists:request_materials,id',
            'type' => 'required|string',
        ]);

        // Create the new DispatchMaterial
        $dispatchMaterial = DispatchMaterial::create($validatedData);

        return response()->json([
            'message' => 'Dispatch material created successfully.',
            'data' => $dispatchMaterial,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Find the DispatchMaterial by ID
        $dispatchMaterial = DispatchMaterial::find($id);

        // Check if the record exists
        if (!$dispatchMaterial) {
            return response()->json(['message' => 'Dispatch material not found.'], 404);
        }

        return response()->json([
            'message' => 'Dispatch material retrieved successfully.',
            'data' => $dispatchMaterial,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate the request, allow partial updates (only provided fields)
        $validatedData = $request->validate([
            'status' => 'sometimes|string',
        ]);

        // Find the DispatchMaterial by ID
        $dispatchMaterial = DispatchMaterial::find($id);

        // Check if the record exists
        if (!$dispatchMaterial) {
            return response()->json(['message' => 'Dispatch material not found.'], 404);
        }

        // Update only the fields that are provided in the request
        $dispatchMaterial->fill($validatedData);
        $dispatchMaterial->save();

        return response()->json([
            'message' => 'Dispatch material updated successfully.',
            'data' => $dispatchMaterial,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Find the DispatchMaterial by ID
        $dispatchMaterial = DispatchMaterial::find($id);

        // Check if the record exists
        if (!$dispatchMaterial) {
            return response()->json(['message' => 'Dispatch material not found.'], 404);
        }

        // Delete the DispatchMaterial
        $dispatchMaterial->delete();

        return response()->json([
            'message' => 'Dispatch material deleted successfully.',
        ]);
    }
}
