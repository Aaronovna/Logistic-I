<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inventory = Inventory::all();

        $inventory = $inventory->map(function ($inventory) {
            return [
                'id' => $inventory->id,
                'quantity' => $inventory->quantity,
                'product_id' => $inventory->product_id,
                'warehouse_id' => $inventory->warehouse_id,
                'warehouse_name' => $inventory->warehouse->name,
                'product_name' => $inventory->product->name ?? 'N/A',
                'product_model' => $inventory->product->model ?? 'N/A',
                'product_price' => $inventory->product->price ?? 'N/A',
                'restock_point' => $inventory->product->restock_point ?? 'N/A',
            ];
        });

        return response()->json($inventory);
    }

    public function groupIndex()
    {
        // Retrieve all inventories
        $inventory = Inventory::all();

        // Group by product_id and sum quantities for products with the same ID
        $groupedInventory = $inventory->groupBy('product_id')->map(function ($group) {
            $firstItem = $group->first();
            return [
                'id' => $firstItem->id,
                'product_id' => $firstItem->product_id,
                'product_name' => $firstItem->product->name ?? 'N/A',
                'product_model' => $firstItem->product->model ?? 'N/A',
                'product_price' => $firstItem->product->price ?? 'N/A',
                'restock_point' => $firstItem->product->restock_point ?? 'N/A',
                'quantity' => $group->sum('quantity'),
            ];
        });

        return response()->json($groupedInventory->values());
    }

    public function indexByWarehouse($warehouseId)
    {
        // Retrieve inventories for the specified warehouse ID
        $inventory = Inventory::where('warehouse_id', $warehouseId)->get();

        // Map the data to include necessary details
        $inventory = $inventory->map(function ($inventory) {
            return [
                'id' => $inventory->id,
                'quantity' => $inventory->quantity,
                'product_id' => $inventory->product_id,
                'warehouse_id' => $inventory->warehouse_id,
                'warehouse_name' => $inventory->warehouse->name,
                'product_name' => $inventory->product->name ?? 'N/A',
                'product_model' => $inventory->product->model ?? 'N/A',
                'product_price' => $inventory->product->price ?? 'N/A',
                'restock_point' => $inventory->product->restock_point ?? 'N/A',
            ];
        });

        return response()->json($inventory);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:infrastructures,id',
        ]);

        DB::transaction(function () use ($validatedData) {
            // Check if the product and warehouse combination already exists in inventories
            $inventory = Inventory::where('product_id', $validatedData['product_id'])
                ->where('warehouse_id', $validatedData['warehouse_id'])
                ->first();

            if ($inventory) {
                // Add the new quantity to the existing inventory
                $newQuantity = $inventory->quantity + $validatedData['quantity'];
                $inventory->update(['quantity' => $newQuantity]);

                // Log the addition action in inventory_trails
                DB::table('inventory_trails')->insert([
                    'user_id' => auth('web')->id(),
                    'product_id' => $validatedData['product_id'],
                    'quantity' => $validatedData['quantity'],
                    'log' => auth('web')->user()->name . " added {$validatedData['quantity']} units to inventory for product_id: {$validatedData['product_id']} in warehouse_id: {$validatedData['warehouse_id']}. Total is now: $newQuantity",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                // Create a new inventory record
                $inventory = Inventory::create($validatedData);

                // Log the creation action in inventory_trails
                DB::table('inventory_trails')->insert([
                    'user_id' => auth('web')->id(),
                    'product_id' => $validatedData['product_id'],
                    'quantity' => $validatedData['quantity'],
                    'log' => auth('web')->user()->name . " created new inventory for product_id: {$validatedData['product_id']} in warehouse_id: {$validatedData['warehouse_id']} with {$validatedData['quantity']} units",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Inventory processed successfully']);
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
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'warehouse_id' => 'required|exists:infrastructures,id',
        ]);

        DB::transaction(function () use ($validatedData, $id) {
            // Find the inventory record or fail
            $inventory = Inventory::findOrFail($id);

            // Ensure the warehouse_id matches
            if ($inventory->warehouse_id != $validatedData['warehouse_id']) {
                throw new \Exception("The warehouse_id does not match the inventory's associated warehouse.");
            }

            // Update the inventory quantity
            $inventory->update(['quantity' => $validatedData['quantity']]);

            // Log the update action in inventory_trails
            DB::table('inventory_trails')->insert([
                'user_id' => auth('web')->id(),
                'product_id' => $inventory->product_id,
                'quantity' => $validatedData['quantity'],
                'log' => auth('web')->user()->name . " set inventory for product_id: {$inventory->product_id} to {$validatedData['quantity']} units in warehouse_id: {$inventory->warehouse_id}",
                'update' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Inventory updated successfully']);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function stats()
    {
        $totalStock = Inventory::sum('quantity');
        $outOfStockProductsCount = Inventory::where('quantity', 0)->count();
        $outOfStockProducts = Inventory::where('quantity', 0)
            ->select(
                'inventories.id',
                'product_id',
                'quantity',
                'products.name as product_name',
                'products.price as product_price',
                'products.restock_point as restock_point'
            )
            ->join('products', 'inventories.product_id', '=', 'products.id') // Joining the 'products' table
            ->get();

        $lowStockProductsCount = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
            ->whereColumn('quantity', '<', 'products.restock_point')
            ->count();
        $lowStockProducts = Inventory::join('products', 'products.id', '=', 'inventories.product_id')
            ->whereColumn('inventories.quantity', '<', 'products.restock_point')
            ->where('inventories.quantity', '>', 0)
            ->select(
                'inventories.id',
                'inventories.product_id',
                'inventories.quantity',
                'products.name as product_name',
                'products.price as product_price',
                'products.restock_point as restock_point'
            )
            ->get();


        $totalStockValue = Inventory::join('products', 'products.id', '=', 'inventories.product_id')
            ->select(DB::raw('SUM(products.price * inventories.quantity) as total_stock_value'))
            ->value('total_stock_value');

        return response()->json([
            'totalStock' => $totalStock,
            'outOfStockProductsCount' => $outOfStockProductsCount,
            'outOfStockProducts' => $outOfStockProducts,
            'lowStockProductsCount' => $lowStockProductsCount,
            'lowStockProducts' => $lowStockProducts,
            'totalStockValue' => $totalStockValue,
        ]);
    }
}
