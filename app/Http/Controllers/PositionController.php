<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Position;

class PositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $positions = Position::all();
        return response()->json(['data' => $positions], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name'
        ]);

        $position = Position::create($validatedData);

        return response()->json(['message' => 'Position created successfully', 'data' => $position], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Position not found'], 404);
        }

        return response()->json(['data' => $position], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Position not found'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name'
        ]);

        $position->update($validatedData);

        return response()->json(['message' => 'Position updated successfully', 'data' => $position], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Position not found'], 404);
        }

        $position->delete();

        return response()->json(['message' => 'Position deleted successfully'], 200);
    }

    public function updatePermission(Request $request, string $id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $validatedData = $request->validate([
            'permissions' => 'required|array', // Ensure 'permissions' is an array
            'permissions.*' => 'array', // Each item in the 'permissions' array should be an array
            'permissions.*.*' => 'boolean' // Each value in the array should be a boolean
        ]);

        // Retrieve the permissions from the request
        $newPermissions = $validatedData['permissions'];

        // Process the permissions data
        $processedPermissions = [];
        foreach ($newPermissions as $permission) {
            foreach ($permission as $key => $value) {
                $processedPermissions[$key] = $value;
            }
        }

        $position->permissions = $processedPermissions;
        $position->save();

        return response()->json(['message' => 'Position permissions updated successfully', 'data' => $position->permissions], 200);
    }
}
