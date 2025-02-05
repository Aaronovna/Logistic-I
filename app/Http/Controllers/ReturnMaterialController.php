<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReturnMaterial;
use Illuminate\Http\JsonResponse;

class ReturnMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $returnMaterials = ReturnMaterial::with(['user', 'infrastructure'])->get();

        $returnMaterials->map(function ($return) {
            $return->requested_by_name = $return->user->name ?? 'N/A';
            $return->infrastructure_name = $return->infrastructure->name ?? 'N/A';
        });

        return response()->json($returnMaterials);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'nullable|json',
            'comment' => 'nullable|string',
            'status' => 'reqired|string',
            'requested_by_id' => 'required|exists:users,id',
            'infrastructure_id' => 'required|exists:infrastructures,id',
        ]);

        $returnMaterial = ReturnMaterial::create($validated);

        return response()->json([
            'message' => 'Return material request created successfully.',
            'data' => $returnMaterial
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $returnMaterial = ReturnMaterial::find($id);

        if (!$returnMaterial) {
            return response()->json(['message' => 'Return material not found.'], 404);
        }

        return response()->json($returnMaterial);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $returnMaterial = ReturnMaterial::find($id);

        if (!$returnMaterial) {
            return response()->json(['message' => 'Return material not found.'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $returnMaterial->update($validated);

        return response()->json([
            'message' => 'Return material updated successfully.',
            'data' => $returnMaterial
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $returnMaterial = ReturnMaterial::find($id);

        if (!$returnMaterial) {
            return response()->json(['message' => 'Return material not found.'], 404);
        }

        $returnMaterial->delete();

        return response()->json(['message' => 'Return material deleted successfully.']);
    }
}
