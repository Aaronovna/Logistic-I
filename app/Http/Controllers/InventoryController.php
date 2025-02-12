<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

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
                    'operation' => 'add',
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
                    'operation' => 'add',
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
        // Retrieve the inventory for the given product ID, including related warehouses and products
        $inventories = Inventory::with('warehouse', 'product')->where('product_id', $id)->get();

        if ($inventories->isEmpty()) {
            return response()->json(['message' => 'Product not found or no inventory available.'], 404);
        }

        // Calculate the total quantity across all warehouses
        $totalQuantity = $inventories->sum('quantity');

        // Map the data for each warehouse
        $inventoryData = $inventories->map(function ($inventory) {
            return [
                'warehouse_id' => $inventory->warehouse_id,
                'warehouse_name' => $inventory->warehouse->name ?? 'N/A',
                'quantity' => $inventory->quantity,
            ];
        });

        // Use the first inventory item to fetch product details
        $product = $inventories->first()->product;

        // Prepare the response data
        $response = [
            'product_id' => $id,
            'product_name' => $product->name ?? 'N/A',
            'product_model' => $product->model ?? 'N/A',
            'product_price' => $product->price ?? 'N/A',
            'restock_point' => $product->restock_point ?? 'N/A',
            'total_quantity' => $totalQuantity,
            'warehouses' => $inventoryData,
        ];

        return response()->json($response);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'warehouse_id' => 'required|exists:infrastructures,id',
            'operation' => 'required|string|in:add,subtract', // Ensure operation is either 'add' or 'subtract'
        ]);

        DB::transaction(function () use ($validatedData, $id) {
            // Find the inventory record or fail
            $inventory = Inventory::findOrFail($id);

            // Ensure the warehouse_id matches
            if ($inventory->warehouse_id != $validatedData['warehouse_id']) {
                throw new \Exception("The warehouse_id does not match the inventory's associated warehouse.");
            }

            // Calculate the new quantity based on the operation
            if ($validatedData['operation'] === 'add') {
                $newQuantity = $inventory->quantity + $validatedData['quantity'];
            } elseif ($validatedData['operation'] === 'subtract') {
                $newQuantity = $inventory->quantity - $validatedData['quantity'];
                if ($newQuantity < 0) {
                    throw new \Exception("The resulting quantity cannot be less than zero.");
                }
            }

            // Update the inventory quantity
            $inventory->update(['quantity' => $newQuantity]);

            // Log the update action in inventory_trails
            DB::table('inventory_trails')->insert([
                'user_id' => auth('web')->id(),
                'product_id' => $inventory->product_id,
                'quantity' => $validatedData['quantity'],
                'operation' => $validatedData['operation'],
                'log' => auth('web')->user()->name . " {$validatedData['operation']}ed {$validatedData['quantity']} units for product_id: {$inventory->product_id} in warehouse_id: {$inventory->warehouse_id}. New quantity: {$newQuantity}",
                'update' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Inventory updated successfully']);
    }

    public function updateStock(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'operation' => 'required|string|in:add,subtract', // Ensure operation is either 'add' or 'subtract'
        ]);

        DB::transaction(function () use ($validatedData, $id) {
            // Find the inventory record by product_id
            $inventory = Inventory::where('product_id', $id)->firstOrFail();

            // Calculate the new quantity based on the operation
            if ($validatedData['operation'] === 'add') {
                $newQuantity = $inventory->quantity + $validatedData['quantity'];
            } elseif ($validatedData['operation'] === 'subtract') {
                $newQuantity = $inventory->quantity - $validatedData['quantity'];
                if ($newQuantity < 0) {
                    throw new \Exception("Not enough stock available for product ID: {$id}");
                }
            }

            // Update the inventory quantity
            $inventory->update(['quantity' => $newQuantity]);

            // Log the update action in inventory_trails
            DB::table('inventory_trails')->insert([
                'user_id' => auth('web')->id(),
                'product_id' => $id,
                'quantity' => $validatedData['quantity'],
                'operation' => $validatedData['operation'],
                'log' => auth('web')->user()->name . " {$validatedData['operation']}ed {$validatedData['quantity']} units for product_id: {$id}. New stock: {$newQuantity}",
                'update' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Stock updated successfully']);
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

    /**
     * Store multiple products in the inventory.
     */
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'nullable|integer|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'warehouse_id' => 'required|integer|exists:infrastructures,id',
        ]);

        try {
            DB::beginTransaction(); // Start a transaction

            $warehouseId = $validated['warehouse_id'];
            $products = $validated['products'];

            foreach ($products as $productData) {
                // Check if product exists
                $product = Product::find($productData['id']);

                // If the product doesn't exist, create it
                if (!$product) {
                    $product = Product::create([
                        'name' => $productData['name'] ?? 'Unnamed Product', // Adjust based on your Product model
                        'description' => $productData['description'] ?? '',
                    ]);
                }

                // Create or update inventory record
                Inventory::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouseId,
                    ],
                    [
                        'quantity' => DB::raw("quantity + {$productData['quantity']}"),
                    ]
                );
            }

            DB::commit(); // Commit the transaction

            return response()->json(['message' => 'Products successfully added to inventory'], 200);
        } catch (\Exception $e) {
            DB::rollBack(); // Roll back the transaction on error
            return response()->json(['error' => 'An error occurred', 'details' => $e->getMessage()], 500);
        }
    }
}
