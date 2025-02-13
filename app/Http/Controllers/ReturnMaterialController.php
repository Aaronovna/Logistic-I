<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReturnMaterial;
use Illuminate\Support\Facades\DB;

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

    public function storeBulkReturnMaterials(Request $request)
    {
        $validated = $request->validate([
            'materials' => 'required|array',
            'materials.*.return_id' => 'required|integer|exists:return_requests,id',
            'materials.*.name' => 'nullable|string',
            'materials.*.quantity' => 'nullable|integer|min:1',
            'materials.*.weight' => 'nullable|integer|min:0',
            'materials.*.category' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction(); // Start a transaction

            foreach ($validated['materials'] as $materialData) {
                ReturnMaterial::create([
                    'return_id' => $materialData['return_id'],
                    'name' => $materialData['name'] ?? '',
                    'quantity' => $materialData['quantity'] ?? null, // Allow nullable values
                    'weight' => $materialData['weight'] ?? null,    // Allow nullable values
                    'category' => $materialData['category'] ?? '',
                ]);
            }

            DB::commit(); // Commit the transaction
            return response()->json(['message' => 'Materials successfully added'], 200);
        } catch (\Exception $e) {
            DB::rollBack(); // Roll back the transaction on error
            return response()->json(['error' => 'An error occurred', 'details' => $e->getMessage()], 500);
        }
    }
}
