<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Http\Controllers\InventoryTrailController;
use Carbon\Carbon;

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
                'model' => optional($inventory->product)->model ?? 'N/A',
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
                'model' => $product->model,
                'image_url' => $product->image_url,
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
                'model' => $inventory->product->model,
                'image_url' => $inventory->product->image_url,
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

    public function getStockDataByPeriod($period, $year = null)
    {
        // Use current year if no year is provided
        $year = $year ?? date('Y');

        switch ($period) {
            case 'year':
                $dateFormat = 'DATE_FORMAT(inventories.created_at, "%Y-%m")';
                $labelKey = 'month';
                $range = range(1, 12); // 12 months in a year
                $formatFunction = function ($i) use ($year) {
                    return $year . '-' . str_pad($i, 2, '0', STR_PAD_LEFT);
                };
                break;

            case 'quarter':
                $dateFormat = 'CONCAT(YEAR(inventories.created_at), "-Q", QUARTER(inventories.created_at))';
                $labelKey = 'quarter';
                $range = range(1, 4); // 4 quarters
                $formatFunction = function ($i) use ($year) {
                    return $year . "-Q$i";
                };
                break;

            case 'month':
            default:
                $dateFormat = 'DATE(inventories.created_at)';
                $labelKey = 'day';
                $range = range(1, 30); // 30 days in a month
                $formatFunction = function ($i) use ($year) {
                    return date("$year-m") . '-' . str_pad($i, 2, '0', STR_PAD_LEFT);
                };
                break;
        }

        // Fetch stock grouped by period & category, filtering by year
        $inventory = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                DB::raw("$dateFormat as period"),
                'categories.name as category',
                DB::raw('COALESCE(SUM(inventories.quantity), 0) as total_stock') // Ensure NULLs become 0
            )
            ->whereYear('inventories.created_at', $year) // Filter by selected year
            ->groupBy('period', 'categories.name')
            ->orderBy('period', 'asc')
            ->get();

        // Initialize structured data with empty values
        $formattedData = [];
        foreach ($range as $i) {
            $formattedData[] = [
                $labelKey => $formatFunction($i),
            ];
        }

        // Map inventory data into the structured array
        foreach ($inventory as $item) {
            $periodValue = $item->period;
            $category = $item->category;
            $totalStock = (int) $item->total_stock;

            // Find the correct index in structured data
            $index = array_search($periodValue, array_column($formattedData, $labelKey));

            if ($index !== false) {
                $formattedData[$index][$category] = $totalStock;
            }
        }

        return response()->json(['data' => $formattedData], 200);
    }

    public function getAvailableYears()
    {
        // Fetch distinct years from the `created_at` column in the inventories table
        $years = Inventory::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc') // Sort from newest to oldest
            ->pluck('year'); // Get an array of years

        // Format the response to match your structure
        $formattedData = $years->toArray();

        return response()->json(['data' => $formattedData], 200);
    }

    public function getTopProductsByCategory($category_id, $top = 8)
    {
        // Fetch category details
        $category = DB::table('categories')->where('id', $category_id)->first();

        // Validate if category exists
        if (!$category) {
            return response()->json(['message' => 'Invalid category ID'], 400);
        }

        // Ensure $top is a positive integer (fallback to default 8 if invalid)
        $top = is_numeric($top) && $top > 0 ? (int) $top : 8;

        // Fetch top N products by inventory stock in the given category
        $topProducts = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
            ->where('products.category_id', $category_id)
            ->select(
                'products.id',
                'products.name',
                'products.brand',
                'products.model',
                'products.price',
                'products.image_url',
                DB::raw('SUM(inventories.quantity) as total_stock')
            )
            ->groupBy('products.id', 'products.name', 'products.brand', 'products.model', 'products.price', 'products.image_url')
            ->orderByDesc('total_stock')
            ->limit($top)
            ->get()
            ->map(function ($product) {
                $product->total_stock = (int) $product->total_stock; // Convert string to integer

                // Fetch inventory turnover rate for the product (using last 30 days)
                $inventoryTrailController = new InventoryTrailController();
                $turnoverResponse = $inventoryTrailController->inventoryTurnover($product->id, 30);
                $turnoverData = json_decode($turnoverResponse->getContent(), true);

                // Attach turnover data to product
                $product->inventory_turnover = $turnoverData['inventory_turnover'] ?? 0;
                $product->turnover_category = $turnoverData['turnover_category'] ?? 'Unknown';

                return $product;
            });

        if ($topProducts->isEmpty()) {
            return response()->json(['message' => 'No products found for this category'], 404);
        }

        return response()->json([
            'category' => [
                'id' => $category->id,
                'name' => $category->name
            ],
            'data' => $topProducts
        ], 200);
    }
}
