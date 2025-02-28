<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;

/* Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum'); */

Route::get('/v1/products/category', [ProductController::class, 'productEachCategory']);
Route::get('/v1/products/supplier', [ProductController::class, 'productEachSupplier']);
Route::get('/v1/products/recent/{limit?}', [ProductController::class, 'recentProducts']);
Route::get('/v1/products/most/{limit?}', [ProductController::class, 'mostExpensiveProducts']);
Route::get('/v1/products/least/{limit?}', [ProductController::class, 'leastExpensiveProducts']);

Route::get('/v1/inventory/total/stock', [InventoryController::class, 'totalStock']);
Route::get('/v1/inventory/out/stock/{limit?}', [InventoryController::class, 'outOfStockProducts']);
Route::get('/v1/inventory/low/stock/{limit?}', [InventoryController::class, 'lowStockProducts']);
Route::get('/v1/inventory/total/value', [InventoryController::class, 'totalStockValue']);
