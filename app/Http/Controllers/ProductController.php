<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Supplier;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['inventory', 'category', 'supplier'])
            ->get()
            ->map(function ($product) {
                $productData = $product->toArray();

                $productData['stock'] = $product->inventory ? $product->inventory->where('product_id', $product->id)->sum('quantity') : 0;
                $productData['category_name'] = $product->category->name ?? 'N/A';
                $productData['supplier_name'] = $product->supplier->name ?? 'N/A';
                $productData['low_on_stock'] = $productData['stock'] <= $product->restock_point;

                unset($productData['inventory'], $productData['category'], $productData['supplier']);

                return $productData;
            });

        return response()->json(['data' => $products], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'restock_point' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $product = Product::create($validatedData);

        return response()->json(['message' => 'Task created successfully.', 'data' => $product,], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['inventory.warehouse', 'category', 'supplier'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $productData = $product->toArray();
        $productData['total_stock'] = $product->inventory->sum('quantity');

        $productData['warehouse_stock_details'] = $product->inventory->map(function ($inventory) {
            return [
                'warehouse_id' => $inventory->warehouse->id ?? 'N/A',
                'warehouse_name' => $inventory->warehouse->name ?? 'N/A',
                'quantity' => $inventory->quantity,
            ];
        });

        $productData['category_name'] = $product->category->name ?? 'N/A';
        $productData['supplier_name'] = $product->supplier->name ?? 'N/A';
        $productData['low_on_stock'] = $productData['total_stock'] <= $product->restock_point;

        unset($productData['inventory'], $productData['category'], $productData['supplier'], $productData['warehouse_stock_details']);

        return response()->json(['data' => $productData], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'restock_point' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $product->update($validatedData);

        return response()->json(['message' => 'Product updated successfully', 'product' => $product], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully'], 200);
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
