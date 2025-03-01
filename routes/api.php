<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;

use App\Http\Controllers\InventoryTrailController;

/* Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum'); */

Route::get('/v1/product/get', [ProductController::class, 'index']);
Route::get('/v1/products/category', [ProductController::class, 'productEachCategory']);
Route::get('/v1/products/supplier', [ProductController::class, 'productEachSupplier']);
Route::get('/v1/products/recent/{limit?}', [ProductController::class, 'recentProducts']);
Route::get('/v1/products/most/{limit?}', [ProductController::class, 'mostExpensiveProducts']);
Route::get('/v1/products/least/{limit?}', [ProductController::class, 'leastExpensiveProducts']);

Route::get('/v1/inventory/total/stock', [InventoryController::class, 'totalStock']);
Route::get('/v1/inventory/out/stock/{limit?}', [InventoryController::class, 'outOfStockProducts']);
Route::get('/v1/inventory/low/stock/{limit?}', [InventoryController::class, 'lowStockProducts']);
Route::get('/v1/inventory/out/count', [InventoryController::class, 'outOfStockProductsCount']);
Route::get('/v1/inventory/low/count', [InventoryController::class, 'lowStockProductsCount']);
Route::get('/v1/inventory/total/value', [InventoryController::class, 'totalStockValue']);

Route::get('/v1/average/inventory/{productId}/{days}', [InventoryTrailController::class, 'averageInventory']);
Route::get('/v1/beginning/inventory/{productId}/{days}', [InventoryTrailController::class, 'getBeginningInventory']);
Route::get('/v1/purchases/{productId}/{days}', [InventoryTrailController::class, 'getPurchases']);
Route::get('/v1/ending/inventory/{productId}', [InventoryTrailController::class, 'getEndingInventory']);
Route::get('/v1/cogs/{productId}/{days}', [InventoryTrailController::class, 'calculateCOGS']);
Route::get('/v1/inventory/turnover/{productId}/{days}', [InventoryTrailController::class, 'inventoryTurnover']);
Route::get('/v1/inventory/stock/{period}', [InventoryController::class, 'getStockDataByPeriod'])->where('period', 'month|quarter|year');
