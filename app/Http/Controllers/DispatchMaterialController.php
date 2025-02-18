<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DispatchMaterial;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DispatchMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retrieve all DispatchMaterials
        $dispatchMaterials = DispatchMaterial::all();

        return response()->json([
            'message' => 'All dispatch materials retrieved successfully.',
            'data' => $dispatchMaterials,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'request_id' => 'required|exists:request_materials,id',
            'type' => 'required|string',
        ]);

        // Create the new DispatchMaterial
        $dispatchMaterial = DispatchMaterial::create($validatedData);

        return response()->json([
            'message' => 'Dispatch material created successfully.',
            'data' => $dispatchMaterial,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Find the DispatchMaterial by ID
        $dispatchMaterial = DispatchMaterial::find($id);

        // Check if the record exists
        if (!$dispatchMaterial) {
            return response()->json(['message' => 'Dispatch material not found.'], 404);
        }

        return response()->json([
            'message' => 'Dispatch material retrieved successfully.',
            'data' => $dispatchMaterial,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate the request, allow partial updates (only provided fields)
        $validatedData = $request->validate([
            'status' => 'sometimes|string',
        ]);

        // Find the DispatchMaterial by ID
        $dispatchMaterial = DispatchMaterial::find($id);

        // Check if the record exists
        if (!$dispatchMaterial) {
            return response()->json(['message' => 'Dispatch material not found.'], 404);
        }

        // Update only the fields that are provided in the request
        $dispatchMaterial->fill($validatedData);
        $dispatchMaterial->save();

        return response()->json([
            'message' => 'Dispatch material updated successfully.',
            'data' => $dispatchMaterial,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Find the DispatchMaterial by ID
        $dispatchMaterial = DispatchMaterial::find($id);

        // Check if the record exists
        if (!$dispatchMaterial) {
            return response()->json(['message' => 'Dispatch material not found.'], 404);
        }

        // Delete the DispatchMaterial
        $dispatchMaterial->delete();

        return response()->json([
            'message' => 'Dispatch material deleted successfully.',
        ]);
    }

    public function createDispatchTrail(string $id)
    {
        // Find the request by ID
        $request = DB::table('request_materials')->where('id', $id)->first();

        // Decode the items JSON
        $items = json_decode($request->items, true);

        // Check if there are any items
        if (!$items || !is_array($items)) {
            return response()->json(['error' => 'No items found in the request'], 400);
        }

        // Loop through items and insert them into the dispatch_trails table
        foreach ($items as $item) {
            DB::table('dispatch_trails')->insert([
                'request_id' => $request->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Dispatch trail created successfully']);
    }

    public function getAllDispatches()
    {
        // Fetch all dispatch trails
        $dispatchTrails = DB::table('dispatch_trails')->get();

        // Return as JSON response
        return response()->json($dispatchTrails);
    }

    public function getDispatchByProduct($productId)
    {
        // Fetch dispatch trails by product_id
        $dispatchTrails = DB::table('dispatch_trails')
            ->where('product_id', $productId)
            ->get();

        // Return as JSON response
        return response()->json($dispatchTrails);
    }

    public function getQuantitiesByProduct($productId)
    {
        // Fetch only the 'quantity' for the given product_id
        $quantities = DB::table('dispatch_trails')
            ->where('product_id', $productId)
            ->pluck('quantity');  // Pluck 'quantity'

        // Return as JSON response
        return response()->json($quantities);
    }

    public function getQuantitiesByProductAndDays($productId, $days)
    {
        // Calculate the date range by subtracting the number of days
        $dateRange = Carbon::now()->subDays($days)->startOfDay();

        // Create an array for the last `$days` days
        $dates = [];
        for ($i = $days; $i > 0; $i--) {
            $dates[] = Carbon::now()->subDays($i)->toDateString(); // Store the date in "Y-m-d" format
        }

        // Fetch 'quantity' values for the given product_id and within the last `$days` days
        $dispatchTrails = DB::table('dispatch_trails')
            ->where('product_id', $productId)
            ->whereBetween('created_at', [$dateRange, Carbon::now()])
            ->get(['quantity', 'created_at']);  // Fetch quantity and created_at for each record

        // Prepare an array with 0s for each day in the range
        $quantities = array_fill(0, $days, 0);

        // Map the dispatch trail data to the corresponding days
        foreach ($dispatchTrails as $dispatch) {
            // Convert 'created_at' to Carbon object and extract the date
            $createdAt = Carbon::parse($dispatch->created_at)->toDateString();

            // Find the corresponding day in the `$dates` array
            $dateIndex = array_search($createdAt, $dates);
            if ($dateIndex !== false) {
                $quantities[$dateIndex] = $dispatch->quantity;
            }
        }

        // Return the quantities array as JSON response
        return response()->json($quantities);
    }
}
