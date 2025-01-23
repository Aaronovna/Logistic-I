<?php

namespace App\Http\Controllers;

use App\Models\RequestMaterial;
use Illuminate\Http\Request;

class RequestMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $requests = RequestMaterial::with('user', 'infrastructure')->get();

        $requests = $requests->map(function ($request) {
            return [
                'id' => $request->id,
                'type' => $request->type,
                'status' => $request->status,
                'user_id' => $request->user_id,
                'user_name' => $request->user->name ?? 'N/A',
                'infrastructure_id' => $request->infrastructure->name ?? 'N/A',
                'items' => $request->items,
            ];
        });

        return response()->json($requests);
    }

    public function indexByDepot()
    {
        $requests = RequestMaterial::with('user', 'infrastructure')
            ->whereHas('infrastructure', function ($query) {
                $query->where('type', 101);  // Filter by infrastructure type equal to 101
            })
            ->get();

        $requests = $requests->map(function ($request) {
            return [
                'id' => $request->id,
                'type' => $request->type,
                'status' => $request->status,
                'user_id' => $request->user_id,
                'user_name' => $request->user->name ?? 'N/A',
                'infrastructure_id' => $request->infrastructure->name ?? 'N/A',
                'items' => $request->items,
            ];
        });

        return response()->json($requests);
    }

    public function indexByTerminal()
    {
        $requests = RequestMaterial::with('user', 'infrastructure')
            ->whereHas('infrastructure', function ($query) {
                $query->where('type', 102);  // Filter by infrastructure type equal to 101
            })
            ->get();

        $requests = $requests->map(function ($request) {
            return [
                'id' => $request->id,
                'type' => $request->type,
                'status' => $request->status,
                'user_id' => $request->user_id,
                'user_name' => $request->user->name ?? 'N/A',
                'infrastructure_id' => $request->infrastructure->name ?? 'N/A',
                'items' => $request->items,
            ];
        });

        return response()->json($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'infrastructure_id' => 'required|exists:infrastructures,id',
            'type' => 'required|string|max:255',
            'items' => 'required|json'
        ]);

        $validatedData['status'] = $validatedData['status'] ?? 'waiting for response';

        try {
            $order = RequestMaterial::create($validatedData);

            return response()->json([
                'message' => 'request created successfully',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create request',
                'error' => $e->getMessage(),
            ], 500);
        }
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $request = RequestMaterial::findOrFail($id);
        $request->delete();
    }
}
