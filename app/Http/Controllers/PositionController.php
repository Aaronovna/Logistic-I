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
        return response()->json($positions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $position = Position::create([
            'name' => $request->name,
        ]);

        return response()->json($position);
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
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $position = Position::findOrFail($id);

        $position->name = $request->input('name');
        $position->save();

        return response()->json([
            'message' => 'Position updated successfully',
            'position' => $position
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $position = Position::findOrFail($id);
        $position->delete();
    }

    public function update_permission(Request $request, string $id)
    {
        $request->validate([
            'permissions' => 'required|array', // Ensure 'permissions' is an array
            'permissions.*' => 'array', // Each item in the 'permissions' array should be an array
            'permissions.*.*' => 'boolean' // Each value in the array should be a boolean
        ]);

        $position = Position::findOrFail($id); // Throws 404 if the position is not found

        // Retrieve the permissions from the request
        $newPermissions = $request->input('permissions');

        // Process the permissions data
        $processedPermissions = [];
        foreach ($newPermissions as $permission) {
            foreach ($permission as $key => $value) {
                $processedPermissions[$key] = $value;
            }
        }

        $position->permissions = $processedPermissions;

        $position->save();

        return response()->json([
            'message' => 'Position permissions updated successfully!',
            'permissions' => $position->permissions
        ], 200);
    }
}
