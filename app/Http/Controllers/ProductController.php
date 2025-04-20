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
            'auto_replenish' => 'required|boolean',
            'perishable' => 'required|boolean',
        ]);

        if ($request->boolean('perishable')) {
            $years = (int) $request->input('shelf_life_years', 0);
            $months = (int) $request->input('shelf_life_months', 0);

            $totalShelfLife = $years * 365 + $months * 30;

            $validatedData['shelf_life'] = $totalShelfLife > 0 ? $totalShelfLife : null;
        } else {
            $validatedData['shelf_life'] = null;
        }

        $product = Product::create($validatedData);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
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
            'auto_replenish' => 'required|boolean',
            'perishable' => 'required|boolean',
        ]);

        if ($request->boolean('perishable')) {
            $years = (int) $request->input('shelf_life_years', 0);
            $months = (int) $request->input('shelf_life_months', 0);

            $totalShelfLife = ($years * 365) + ($months * 30);

            $validatedData['shelf_life'] = $totalShelfLife > 0 ? $totalShelfLife : null;
        } else {
            $validatedData['shelf_life'] = null;
        }

        $product->update($validatedData);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ], 200);
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

    public function productEachCategory()
    {
        $categories = Category::with(['products:id,name,category_id,price'])
            ->get()
            ->map(function ($category) {
                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'products' => $category->products
                ];
            });

        return response()->json(['data' => $categories], 200);
    }

    public function productEachSupplier()
    {
        $suppliers = Supplier::with(['products:id,name,supplier_id,price'])
            ->get()
            ->map(function ($supplier) {
                return [
                    'supplier_id' => $supplier->id,
                    'supplier_name' => $supplier->name,
                    'products' => $supplier->products
                ];
            });

        return response()->json(['data' => $suppliers], 200);
    }

    public function recentProducts($limit = 5)
    {
        $recentProducts = Product::orderBy('created_at', 'desc')
            ->take($limit)
            ->get(['id', 'name', 'created_at']);

        return response()->json(['data' => $recentProducts], 200);
    }

    public function mostExpensiveProducts($limit = 5)
    {
        $mostExpensiveProducts = Product::orderBy('price', 'desc')
            ->take($limit)
            ->get(['id', 'name', 'price']);

        return response()->json(['data' => $mostExpensiveProducts], 200);
    }

    public function leastExpensiveProducts($limit = 5)
    {
        $leastExpensiveProducts = Product::orderBy('price', 'asc')
            ->take($limit)
            ->get(['id', 'name', 'price']);

        return response()->json(['data' => $leastExpensiveProducts], 200);
    }
}
