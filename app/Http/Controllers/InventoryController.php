<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Http\Controllers\InventoryTrailController;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inventory = Inventory::with(['warehouse', 'product'])->get()->map(function ($inventory) {
            $inventoryData = $inventory->toArray();

            $inventoryData['warehouse_name'] = $inventory->warehouse->name ?? 'N/A';
            $inventoryData['product_name'] = $inventory->product->name ?? 'N/A';
            $inventoryData['product_model'] = $inventory->product->model ?? 'N/A';
            $inventoryData['product_price'] = $inventory->product->price ?? 'N/A';
            $inventoryData['restock_point'] = $inventory->product->restock_point ?? 'N/A';

            unset($inventoryData['warehouse'], $inventoryData['product']);

            return $inventoryData;
        });

        return response()->json(['data' => $inventory], 200);
    }

    public function indexGrouped()
    {
        $inventory = Inventory::with('product')->get();

        $groupedInventory = $inventory->groupBy('product_id')->map(function ($group) {
            $firstItem = $group->first();
            $inventoryData = $firstItem->toArray();

            return [
                'id' => $inventoryData['id'],
                'product_id' => $inventoryData['product_id'],
                'product_name' => $firstItem->product->name ?? 'N/A',
                'product_model' => $firstItem->product->model ?? 'N/A',
                'product_price' => $firstItem->product->price ?? 'N/A',
                'restock_point' => $firstItem->product->restock_point ?? 'N/A',
                'quantity' => $group->sum('quantity'),
            ];
        });

        return response()->json(['data' => $groupedInventory->values()], 200);
    }


    public function indexByWarehouse($warehouseId)
    {
        $inventory = Inventory::with(['warehouse', 'product'])
            ->where('warehouse_id', $warehouseId)
            ->get()
            ->map(function ($inventory) {
                $inventoryData = $inventory->toArray();

                $inventoryData['warehouse_name'] = $inventory->warehouse->name ?? 'N/A';
                $inventoryData['product_name'] = $inventory->product->name ?? 'N/A';
                $inventoryData['product_model'] = $inventory->product->model ?? 'N/A';
                $inventoryData['product_price'] = $inventory->product->price ?? 'N/A';
                $inventoryData['restock_point'] = $inventory->product->restock_point ?? 'N/A';

                unset($inventoryData['warehouse'], $inventoryData['product']);

                return $inventoryData;
            });

        return response()->json(['data' => $inventory], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:infrastructures,id',
        ]);

        DB::transaction(function () use ($validatedData) {
            $inventory = Inventory::where('product_id', $validatedData['product_id'])
                ->where('warehouse_id', $validatedData['warehouse_id'])
                ->first();

            if ($inventory) {
                $newQuantity = $inventory->quantity + $validatedData['quantity'];
                $inventory->update(['quantity' => $newQuantity]);

                // Log addition in inventory_trails using TrailController
                app(InventoryTrailController::class)->storeTrail(
                    auth('web')->id(),
                    $validatedData['product_id'],
                    $validatedData['quantity'],
                    'add',
                    auth('web')->user()->name . " added {$validatedData['quantity']} units to inventory for product_id: {$validatedData['product_id']} in warehouse_id: {$validatedData['warehouse_id']}. Total is now: $newQuantity"
                );
            } else {
                Inventory::create($validatedData);

                // Log creation in inventory_trails using TrailController
                app(InventoryTrailController::class)->storeTrail(
                    auth('web')->id(),
                    $validatedData['product_id'],
                    $validatedData['quantity'],
                    'add',
                    auth('web')->user()->name . " created new inventory for product_id: {$validatedData['product_id']} in warehouse_id: {$validatedData['warehouse_id']} with {$validatedData['quantity']} units"
                );
            }
        });

        return response()->json(['message' => 'Inventory processed successfully']);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $inventories = Inventory::with(['warehouse', 'product'])->where('product_id', $id)->get();

        if ($inventories->isEmpty()) {
            return response()->json(['message' => 'Product not found or no inventory available.'], 404);
        }

        $product = $inventories->first()->product;
        $productData = $product->toArray();

        $productData['total_quantity'] = $inventories->sum('quantity');
        $productData['warehouses'] = $inventories->map(function ($inventory) {
            return [
                'warehouse_id' => $inventory->warehouse_id,
                'warehouse_name' => $inventory->warehouse->name ?? 'N/A',
                'quantity' => $inventory->quantity,
            ];
        });

        unset($productData['inventory']);

        return response()->json(['data' => $productData], 200);
    }

    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'warehouse_id' => 'required|exists:infrastructures,id',
            'operation' => 'required|string|in:add,subtract',
        ]);

        DB::transaction(function () use ($validatedData, $id) {
            $inventory = Inventory::findOrFail($id);

            if ($inventory->warehouse_id != $validatedData['warehouse_id']) {
                throw new \Exception("The warehouse_id does not match the inventory's associated warehouse.");
            }

            $newQuantity = $validatedData['operation'] === 'add'
                ? $inventory->quantity + $validatedData['quantity']
                : $inventory->quantity - $validatedData['quantity'];

            if ($newQuantity < 0) {
                throw new \Exception("The resulting quantity cannot be less than zero.");
            }

            $inventory->update(['quantity' => $newQuantity]);

            // Log the update in inventory_trails using TrailController
            app(InventoryTrailController::class)->storeTrail(
                auth('web')->id(),
                $inventory->product_id,
                $validatedData['quantity'],
                $validatedData['operation'],
                auth('web')->user()->name . " {$validatedData['operation']}ed {$validatedData['quantity']} units for product_id: {$inventory->product_id} in warehouse_id: {$inventory->warehouse_id}. New quantity: {$newQuantity}",
                true
            );
        });

        return response()->json(['message' => 'Inventory updated successfully']);
    }

    public function updateInDispatch(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:0',
            'operation' => 'required|string|in:add,subtract',
        ]);

        DB::transaction(function () use ($validatedData, $id) {
            $inventory = Inventory::where('product_id', $id)->firstOrFail();

            $newQuantity = $validatedData['operation'] === 'add'
                ? $inventory->quantity + $validatedData['quantity']
                : $inventory->quantity - $validatedData['quantity'];

            if ($newQuantity < 0) {
                throw new \Exception("Not enough stock available for product ID: {$id}");
            }

            $inventory->update(['quantity' => $newQuantity]);

            // Log the update in inventory_trails using TrailController
            app(InventoryTrailController::class)->storeTrail(
                auth('web')->id(),
                $id,
                $validatedData['quantity'],
                $validatedData['operation'],
                auth('web')->user()->name . " {$validatedData['operation']}ed {$validatedData['quantity']} units for product_id: {$id}. New stock: {$newQuantity}",
                true
            );
        });

        return response()->json(['message' => 'Stock updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory not found'], 404);
        }

        $inventory->delete();

        return response()->json(['message' => 'Inventory deleted successfully'], 200);
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
            DB::beginTransaction(); // Start transaction

            $warehouseId = $validated['warehouse_id'];
            $products = $validated['products'];

            foreach ($products as $productData) {
                // Check if product exists
                $product = Product::find($productData['id']);

                // If the product doesn't exist, create it
                if (!$product) {
                    $product = Product::create([
                        'name' => $productData['name'] ?? 'Unnamed Product',
                        'description' => $productData['description'] ?? '',
                    ]);
                }

                // Retrieve previous quantity
                $inventory = Inventory::where('product_id', $product->id)
                    ->where('warehouse_id', $warehouseId)
                    ->first();

                $previousQuantity = $inventory ? $inventory->quantity : 0;
                $newQuantity = $previousQuantity + $productData['quantity'];

                // Create or update inventory record
                Inventory::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouseId,
                    ],
                    [
                        'quantity' => $newQuantity,
                    ]
                );

                // Log inventory addition in `inventory_trails` using TrailController
                app(InventoryTrailController::class)->storeTrail(
                    auth('web')->id(),
                    $product->id,
                    $productData['quantity'],
                    'add',
                    auth('web')->user()->name . " added {$productData['quantity']} units to product_id: {$product->id} in warehouse_id: {$warehouseId}. New quantity: {$newQuantity}"
                );
            }

            DB::commit(); // Commit transaction

            return response()->json(['message' => 'Products successfully added to inventory'], 200);
        } catch (\Exception $e) {
            DB::rollBack(); // Rollback transaction on error
            return response()->json(['message' => 'An error occurred', 'details' => $e->getMessage()], 500);
        }
    }


    public function totalStock()
    {
        $totalQuantity = Inventory::sum('quantity');

        return response()->json(['data' => ['total_quantity' => $totalQuantity]], 200);
    }

    public function outOfStockProducts($limit = 5)
    {
        $products = collect(); // Initialize an empty collection

        // Get products that have inventory but are out of stock
        $outOfStockInventories = Inventory::with('product')
            ->where('quantity', 0)
            ->limit($limit) // Apply limit here if needed
            ->get();

        foreach ($outOfStockInventories as $inventory) {
            $products->push([
                'product_id' => $inventory->product_id,
                'name' => optional($inventory->product)->name ?? 'N/A',
                'price' => optional($inventory->product)->price ?? 0,
                'restock_point' => optional($inventory->product)->restock_point ?? 0,
            ]);
        }

        // Get products that have no inventory at all
        $productsWithoutInventory = Product::doesntHave('inventory')
            ->limit($limit) // Apply limit here if needed
            ->get();

        foreach ($productsWithoutInventory as $product) {
            $products->push([
                'product_id' => $product->id,
                'name' => $product->name ?? 'N/A',
                'price' => $product->price ?? 0,
                'restock_point' => $product->restock_point ?? 0,
            ]);
        }

        if ($products->isEmpty()) {
            return response()->json(['message' => 'No out-of-stock products found.'], 404);
        }

        return response()->json(['data' => $products->take($limit)], 200);
    }


    public function outOfStockProductsCount()
    {
        // Count products that have inventory but are out of stock
        $countOutOfStock = Inventory::where('quantity', 0)->count();

        // Count products that have no inventory records
        $countNoInventory = Product::doesntHave('inventory')->count();

        return response()->json(['data' => ['out_of_stock_count' => $countOutOfStock + $countNoInventory]], 200);
    }


    public function lowStockProducts($limit = 5)
    {
        $inventories = Inventory::with('product')
            ->where('quantity', '>', 0) // Exclude out-of-stock items
            ->whereHas('product', function ($query) {
                $query->whereColumn('inventories.quantity', '<', 'products.restock_point');
            })
            ->limit($limit)
            ->get();

        if ($inventories->isEmpty()) {
            return response()->json(['message' => 'No low-stock products found.'], 404);
        }

        $products = $inventories->map(function ($inventory) {
            return [
                'product_id' => $inventory->product_id,
                'name' => $inventory->product->name ?? 'N/A',
                'price' => $inventory->product->price ?? 0,
                'restock_point' => $inventory->product->restock_point ?? 0,
                'quantity' => $inventory->quantity,
            ];
        });

        return response()->json(['data' => $products], 200);
    }

    public function lowStockProductsCount()
    {
        $count = Inventory::where('quantity', '>', 0)
            ->whereHas('product', function ($query) {
                $query->whereColumn('inventories.quantity', '<', 'products.restock_point');
            })
            ->count();

        return response()->json(['data' => ['low_stock_count' => $count]], 200);
    }

    public function totalStockValue()
    {
        $totalValue = Inventory::with('product')
            ->get()
            ->sum(function ($inventory) {
                return ($inventory->product->price ?? 0) * $inventory->quantity;
            });

        return response()->json(['data' => ['total_stock_value' => $totalValue]], 200);
    }
}
