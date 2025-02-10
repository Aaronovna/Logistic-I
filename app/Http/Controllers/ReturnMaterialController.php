<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReturnMaterial;

class ReturnMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $materials = ReturnMaterial::all();
        return response()->json($materials);
    }

    /**
     * Store a newly created return material in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'return_id' => 'required|exists:return_requests,id',
            'name' => 'nullable|string',
            'quantity' => 'nullable|integer',
            'weight' => 'nullable|integer',
            'category' => 'nullable|string',
        ]);

        $material = ReturnMaterial::create($validated);

        return response()->json([
            'message' => 'Return material created successfully!',
            'data' => $material
        ], 201);
    }

    /**
     * Display the specified return material.
     */
    public function show(ReturnMaterial $returnMaterial)
    {
        return response()->json($returnMaterial);
    }

    /**
     * Update the specified return material in storage.
     */
    public function update(Request $request, ReturnMaterial $returnMaterial)
    {
        $validated = $request->validate([
            'return_id' => 'required|exists:return_requests,id',
            'name' => 'nullable|string',
            'quantity' => 'nullable|integer',
            'weight' => 'nullable|integer',
            'category' => 'nullable|string',
        ]);

        $returnMaterial->update($validated);

        return response()->json([
            'message' => 'Return material updated successfully!',
            'data' => $returnMaterial
        ]);
    }

    /**
     * Remove the specified return material from storage.
     */
    public function destroy(ReturnMaterial $returnMaterial)
    {
        $returnMaterial->delete();

        return response()->json([
            'message' => 'Return material deleted successfully!'
        ]);
    }
}
