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
        return response()->json(['data' => $materials], 200);
    }

    /**
     * Store a newly created return material in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'return_id' => 'required|exists:return_requests,id',
            'name' => 'required|string',
            'quantity' => 'required|integer',
            'unit' => 'required|string',
            'category' => 'required|string',
        ]);

        $material = ReturnMaterial::create($validatedData);

        return response()->json(['message' => 'Return material created successfully', 'data' => $material], 201);
    }

    /**
     * Display the specified return material.
     */
    public function show(string $id)
    {
        $material = ReturnMaterial::find($id);

        if (!$material) {
            return response()->json(['message' => 'Return material not found'], 404);
        }

        return response()->json(['data' => $material], 200);
    }

    /**
     * Update the specified return material in storage.
     */
    public function update(Request $request, string $id)
    {
        $material = ReturnMaterial::find($id);

        if (!$material) {
            return response()->json(['message' => 'Return material not found'], 404);
        }

        $validatedData = $request->validate([
            'return_id' => 'required|exists:return_requests,id',
            'name' => 'nullable|string',
            'quantity' => 'nullable|integer',
            'unit' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $material->update($validatedData);

        return response()->json(['message' => 'Return material updated successfully', 'data' => $material], 200);
    }

    /**
     * Remove the specified return material from storage.
     */
    public function destroy(string $id)
    {
        $material = ReturnMaterial::find($id);

        if (!$material) {
            return response()->json(['message' => 'Return material not found'], 404);
        }

        $material->delete();

        return response()->json(['message' => 'Return material deleted successfully'], 200);
    }

    public function storeBulk(Request $request)
    {
        $validatedData = $request->validate([
            'materials' => 'required|array',
            'materials.*.return_id' => 'required|integer|exists:return_requests,id',
            'materials.*.name' => 'nullable|string',
            'materials.*.quantity' => 'nullable|integer|min:1',
            'materials.*.unit' => 'nullable|string',
            'materials.*.category' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction(); // Start a transaction

            foreach ($validatedData['materials'] as $materialData) {
                ReturnMaterial::create([
                    'return_id' => $materialData['return_id'],
                    'name' => $materialData['name'] ?? '',
                    'quantity' => $materialData['quantity'] ?? null,
                    'unit' => $materialData['unit'] ?? null,
                    'category' => $materialData['category'] ?? '',
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Materials successfully added'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'An error occurred', 'details' => $e->getMessage()], 500);
        }
    }
}
