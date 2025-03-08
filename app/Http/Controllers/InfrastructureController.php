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
        return response()->json(['data' => $infrastructures], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'type' => 'required|integer',
            'name' => 'required|string|max:255|unique:infrastructures,name',
            'address' => 'required|string',
            'image_url' => 'nullable|string',
            'access' => 'nullable|json',
            'lat' => 'nullable|numeric|min:-90|max:90',
            'lng' => 'nullable|numeric|min:-180|max:180',
        ]);

        $infrastructure = Infrastructure::create($validatedData);

        return response()->json(['message' => 'Infrastructure created successfully', 'data' => $infrastructure,], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $infrastructure = Infrastructure::findOrFail($id);

        if (!$infrastructure) {
            return response()->json(['message' => 'Infrastructure not found.'], 404);
        }

        return response()->json($infrastructure);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $infrastructure = Infrastructure::find($id);

        if (!$infrastructure) {
            return response()->json(['message' => 'Infrastructure not found'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'image_url' => 'nullable|string',
            'access' => 'nullable|json',
            'lat' => 'nullable|numeric|min:-90|max:90',
            'lng' => 'nullable|numeric|min:-180|max:180',
        ]);

        $infrastructure->update($validatedData);

        return response()->json(['message' => 'Infrastructure updated successfully', 'data' => $infrastructure], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $infrastructure = Infrastructure::find($id);

        if (!$infrastructure) {
            return response()->json(['message' => 'Infrastructure not found'], 404);
        }

        $infrastructure->delete();

        return response()->json(['message' => 'Infrastructure deleted successfully'], 200);
    }

    public function indexByAccess()
    {
        $user = auth()->user(); // Get authenticated user

        // If the user is Super Admin (2050) or Admin (2051), return all infrastructures
        if (in_array($user->type, [2050, 2051])) {
            $infrastructures = Infrastructure::all();
        } else {
            // Convert position_id to string to match the JSON structure
            $positionId = (string) $user->position_id;

            // Query infrastructures where 'access' contains the position_id as a string
            $infrastructures = Infrastructure::whereJsonContains('access', $positionId)->get();
        }

        return response()->json(['data' => $infrastructures], 200);
    }
}
