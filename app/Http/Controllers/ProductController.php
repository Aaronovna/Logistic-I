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

        $products = Product::all();

        $products = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'brand' => $product->brand,
                'model' => $product['model'],
                'description' => $product->description,
                'image_url' => $product->image_url,
                'price' => $product->price,
                'stock' => $product->stock,
                'restock_point' => $product->restock_point,
                'category_id' => $product->category_id,
                'supplier_id' => $product->supplier_id,
                'category_name' => $product->category->name ?? 'N/A',
                'supplier_name' => $product->supplier->name ?? 'N/A',
                'low_on_stock' => $product->stock <= $product->restock_point,
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
        //
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
        $totalStock = Product::sum('stock');
        $outOfStockProducts = Product::where('stock', 0)->count();
        $lowStockProducts = Product::whereColumn('stock', '<', 'restock_point')->count();
        $totalStockValue = Product::sum(DB::raw('price * stock'));

        // $topSellingProducts = Product::withSum('sales', 'quantity')
        //     ->orderBy('sales_sum_quantity', 'desc')
        //     ->take(5)
        //     ->get(['id', 'name', 'brand', 'model']); // Adjust fields as needed
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
            'totalStock' => $totalStock,
            'outOfStockProducts' => $outOfStockProducts,
            'lowStockProducts' => $lowStockProducts,
            'totalStockValue' => $totalStockValue,

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
