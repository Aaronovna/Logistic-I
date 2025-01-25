<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Inventory;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retrieve all products with related inventory, category, and supplier data
        $products = Product::with('inventory', 'category', 'supplier')->get();

        // Map the data to include the total stock per product across all warehouses
        $products = $products->map(function ($product) {
            // Sum up the quantities of inventory for each product only if product_id is the same
            $totalStock = $product->inventory ? $product->inventory->where('product_id', $product->id)->sum('quantity') : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'brand' => $product->brand,
                'model' => $product->model,
                'description' => $product->description,
                'image_url' => $product->image_url,
                'price' => $product->price,
                'stock' => $totalStock, // Total stock per product across all warehouses
                'restock_point' => $product->restock_point,
                'category_id' => $product->category_id,
                'supplier_id' => $product->supplier_id,
                'category_name' => $product->category->name ?? 'N/A',
                'supplier_name' => $product->supplier->name ?? 'N/A',
                'low_on_stock' => $totalStock <= $product->restock_point,
            ];
        });

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'required|string',
            'price' => 'required|numeric|min:0',
            'restock_point' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $product = Product::create($validatedData);

        return response()->json($product);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Retrieve the product using its ID and load related models
        $product = Product::with(['inventory.warehouse', 'category', 'supplier'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        // Calculate total stock across all warehouses
        $totalStock = $product->inventory->sum('quantity');

        // Map the inventory to include warehouse-specific stock details
        $warehouseStockDetails = $product->inventory->map(function ($inventory) {
            return [
                'warehouse_id' => $inventory->warehouse->id ?? 'N/A',
                'warehouse_name' => $inventory->warehouse->name ?? 'N/A',
                'quantity' => $inventory->quantity,
            ];
        });

        // Prepare the response data
        $response = [
            'id' => $product->id,
            'name' => $product->name,
            'brand' => $product->brand,
            'model' => $product->model,
            'description' => $product->description,
            'image_url' => $product->image_url,
            'price' => $product->price,
            'total_stock' => $totalStock, // Total stock across all warehouses
            'restock_point' => $product->restock_point,
            'category_id' => $product->category_id,
            'supplier_id' => $product->supplier_id,
            'category_name' => $product->category->name ?? 'N/A',
            'supplier_name' => $product->supplier->name ?? 'N/A',
            'low_on_stock' => $totalStock <= $product->restock_point, // Based on total stock
            'warehouse_stock_details' => $warehouseStockDetails, // Stock details for each warehouse
        ];

        return response()->json($response);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'restock_point' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $product = Product::findOrFail($id);

        $product->update($request);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
    }

    public function stats()
    {
        $totalProducts = Product::count();
        //$totalStock = Product::sum('stock');
        //$outOfStockProductsCount = Product::where('stock', 0)->count();
        //$outOfStockProducts = Product::where('stock', 0)->select('id', 'name', 'model', 'stock', 'restock_point')->get();
        //$lowStockProductsCount = Product::whereColumn('stock', '<', 'restock_point')->count();
        //$lowStockProducts = Product::whereColumn('stock', '<', 'restock_point')->where('stock', '>', 0)->get();
        //$totalStockValue = Product::sum(DB::raw('price * stock'));

        $totalCategories = Category::count();
        $totalSuppliers = Supplier::count();
        $productsByCategory = Product::select('category_id', DB::raw('count(*) as total'))
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(function ($categoryData) {
                return $this->formatData($categoryData, 'category');
            });

        $productsBySupplier = Product::select('supplier_id', DB::raw('count(*) as total'))
            ->groupBy('supplier_id')
            ->with('supplier:id,name')
            ->get()
            ->map(function ($supplierData) {
                return $this->formatData($supplierData, 'supplier');
            });

        $productsMissingImage = Product::whereNull('image_url')->orWhere('image_url', '')->count();
        $averagePrice = Product::avg('price');
        $mostExpensiveProduct = Product::orderBy('price', 'desc')->first(['id', 'name', 'price']);
        $leastExpensiveProduct = Product::orderBy('price', 'asc')->first(['id', 'name', 'price']);
        $recentProducts = Product::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'created_at']);

        return response()->json([
            'totalProducts' => $totalProducts,
            //'totalStock' => $totalStock,
            //'outOfStockProductsCount' => $outOfStockProductsCount,
            //'outOfStockProducts' => $outOfStockProducts,
            //'lowStockProductsCount' => $lowStockProductsCount,
            //'lowStockProducts' => $lowStockProducts,
            //'totalStockValue' => $totalStockValue,

            // 'topSellingProducts' => $topSellingProducts,
            'totalCategories' => $totalCategories,
            'totalSuppliers' => $totalSuppliers,
            'productsByCategory' => $productsByCategory,
            'productsBySupplier' => $productsBySupplier,

            'productsMissingImage' => $productsMissingImage,
            'averagePrice' => $averagePrice,
            'mostExpensiveProduct' => $mostExpensiveProduct,
            'leastExpensiveProduct' => $leastExpensiveProduct,
            'recentProducts' => $recentProducts,
        ]);
    }
    private function formatData($data, $type)
    {
        if ($type === 'category') {
            return [
                'category_id' => $data->category_id,
                'category_name' => $data->category->name ?? 'N/A',
                'total' => $data->total
            ];
        } elseif ($type === 'supplier') {
            return [
                'supplier_id' => $data->supplier_id,
                'supplier_name' => $data->supplier->name ?? 'N/A',
                'total' => $data->total
            ];
        }

        return [];
    }
}
