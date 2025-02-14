<?php

namespace App\Http\Controllers;

use App\Models\ReturnRequest;
use Illuminate\Http\Request;

class ReturnRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $returnMaterials = ReturnRequest::with(['user', 'infrastructure'])->get();

        $returnMaterials->map(function ($return) {
            $return->requested_by_name = $return->user->name ?? 'N/A';
            $return->infrastructure_name = $return->infrastructure->name ?? 'N/A';
        });

        return response()->json($returnMaterials);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|json',
            'comment' => 'required|string',
            'status' => 'reqired|string',
            'requested_by_id' => 'required|exists:users,id',
            'infrastructure_id' => 'required|exists:infrastructures,id',
        ]);

        $returnMaterial = ReturnRequest::create($validated);

        return response()->json([
            'message' => 'Return material request created successfully.',
            'data' => $returnMaterial
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $returnMaterial = ReturnRequest::find($id);

        if (!$returnMaterial) {
            return response()->json(['message' => 'Return material not found.'], 404);
        }

        return response()->json($returnMaterial);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $returnMaterial = ReturnRequest::find($id);

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
    public function destroy(string $id)
    {
        $returnMaterial = ReturnRequest::find($id);

        if (!$returnMaterial) {
            return response()->json(['message' => 'Return material not found.'], 404);
        }

        $returnMaterial->delete();

        return response()->json(['message' => 'Return material deleted successfully.']);
    }
}
