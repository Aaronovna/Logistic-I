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
        $requestMaterials = RequestMaterial::with('user', 'infrastructure')->get()
            ->map(function ($selectedRequest) {
                $request = $selectedRequest->toArray();

                $request['user_name'] = $selectedRequest->user->name ?? 'N/A';
                $request['infrastructure_name'] = $selectedRequest->infrastructure->name ?? 'N/A';

                unset($request['user'], $request['infrastructure']);

                return $request;
            });

        return response()->json(['data' => $requestMaterials], 200);
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

        $requestMaterial = RequestMaterial::create($validatedData);

        return response()->json(['message' => 'Request created successfully.', 'data' => $requestMaterial,], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $selectedRequestMaterial = RequestMaterial::with(['assignedToUser', 'assignedByUser'])->find($id);

        if (!$selectedRequestMaterial) {
            return response()->json(['error' => 'Request not found'], 404);
        }

        $requestMaterial = $selectedRequestMaterial->toArray();

        $requestMaterial['user_name'] = $selectedRequestMaterial->user->name ?? 'N/A';
        $requestMaterial['infrastructure_name'] = $selectedRequestMaterial->infrastructure->name ?? 'N/A';

        unset($requestMaterial['user'], $requestMaterial['infrastructure']);

        return response()->json(['data' => $requestMaterial], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $requestMaterial = RequestMaterial::find($id);

        if (!$requestMaterial) {
            return response()->json(['message' => 'Request material not found.'], 404);
        }

        $validatedData = $request->validate([
            'status' => 'required|string',
            'items' => 'sometimes|json',
        ]);

        $requestMaterial->update($validatedData);

        return response()->json(['message' => 'Request updated successfully', 'data' => $requestMaterial], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $requestMaterial = RequestMaterial::find($id);

        if (!$requestMaterial) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $requestMaterial->delete();

        return response()->json(['message' => 'Request deleted successfully'], 200);
    }

    public function indexDepot()
    {
        $requestMaterials = RequestMaterial::with('user', 'infrastructure')
            ->whereHas('infrastructure', function ($query) {
                $query->where('type', 101);
            })
            ->get()
            ->map(function ($selectedRequest) {
                $request = $selectedRequest->toArray();

                $request['user_name'] = $selectedRequest->user->name ?? 'N/A';
                $request['infrastructure_name'] = $selectedRequest->infrastructure->name ?? 'N/A';

                unset($request['user'], $request['infrastructure']);

                return $request;
            });

        return response()->json(['data' => $requestMaterials], 200);
    }

    public function indexTerminal()
    {
        $requestMaterials = RequestMaterial::with('user', 'infrastructure')
            ->whereHas('infrastructure', function ($query) {
                $query->where('type', 102);
            })
            ->get()
            ->map(function ($selectedRequest) {
                $request = $selectedRequest->toArray();

                $request['user_name'] = $selectedRequest->user->name ?? 'N/A';
                $request['infrastructure_name'] = $selectedRequest->infrastructure->name ?? 'N/A';

                unset($request['user'], $request['infrastructure']);

                return $request;
            });

        return response()->json(['data' => $requestMaterials], 200);
    }
}
