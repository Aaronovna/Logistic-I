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
        $requests = ReturnRequest::with(['user', 'infrastructure'])->get()
            ->map(function ($I) {
                $request = $I->toArray();

                $request['requested_by_name'] = $I->user->name ?? 'N/A';
                $request['infrastructure_name'] = $I->infrastructure->name ?? 'N/A';

                unset($request['user'], $request['infrastructure']);

                return $request;
            });

        return response()->json(['data' => $requests], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'items' => 'required|json',
            'comment' => 'required|string',
            'status' => 'reqired|string',
            'requested_by_id' => 'required|exists:users,id',
            'infrastructure_id' => 'required|exists:infrastructures,id',
        ]);

        $returnRequest = ReturnRequest::create($validatedData);

        return response()->json(['message' => 'Return request created successfully.', 'data' => $returnRequest], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $selectedRequest = ReturnRequest::with(['user', 'infrastructure'])->find($id);

        if (!$selectedRequest) {
            return response()->json(['error' => 'Return request not found'], 404);
        }
        $request = $selectedRequest->toArray();

        $request['requested_by_name'] = $selectedRequest->user->name ?? 'N/A';
        $request['infrastructure_name'] = $selectedRequest->infrastructure->name ?? 'N/A';

        unset($request['user'], $request['infrastructure']);

        return response()->json(['data' => $request], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $returnRequest = ReturnRequest::find($id);

        if (!$returnRequest) {
            return response()->json(['message' => 'Return request not found.'], 404);
        }

        $validatedData = $request->validate([
            'status' => 'required|string',
        ]);

        $returnRequest->update($validatedData);

        return response()->json(['message' => 'Return request updated successfully.', 'data' => $returnRequest], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $returnRequest = ReturnRequest::find($id);

        if (!$returnRequest) {
            return response()->json(['message' => 'Return request not found.'], 404);
        }

        $returnRequest->delete();

        return response()->json(['message' => 'Return request deleted successfully.'], 200);
    }
}
