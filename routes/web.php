<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SupplierController;

Route::redirect('/', 'login');

//? START: PAGES ROUTES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Route::middleware(["auth", "verified"])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/category', fn () => Inertia::render('Category'))->name('category');
    Route::get('/user', fn () => Inertia::render('User'))->name('user');
    Route::get('/report', fn () => Inertia::render('Report'))->name('report');
    Route::get('/product', fn () => Inertia::render('Product'))->name('product');
    Route::get('/receipt', fn () => Inertia::render('Receipt'))->name('receipt');
    Route::get('/receipt/history', fn () => Inertia::render('Receipt.History'))->name('receipt-history');
    Route::get('/dispatch', fn () => Inertia::render('Dispatch'))->name('dispatch');
    Route::get('/warehouse', fn () => Inertia::render('Warehouse'))->name('warehouse');
    Route::get('/depot', fn () => Inertia::render('Depot'))->name('depot');
    Route::get('/terminal', fn () => Inertia::render('Terminal'))->name('terminal');
    Route::get('/terminal/request', fn () => Inertia::render('Terminal.Request'))->name('terminal-request');
    Route::get('/audits', action: fn () => Inertia::render('Audits'))->name('audits');
    Route::get('/auditors', fn () => Inertia::render('Auditors'))->name('auditors');
});

//! END: PAGES ROUTES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// REQUEST ROUTES
Route::middleware(["auth", "verified"])->group(function () {

    //? START: PRODUCT REQUEST /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    Route::get('/product/get', [ProductController::class, 'index'])->name('product.index');
    Route::post('/product/store', [ProductController::class, 'store'])->name('product.store');
    Route::patch('/product/update/{id}', [ProductController::class, 'update'])->name('product.update');
    Route::delete('/product/delete/{id}', [ProductController::class, 'destroy'])->name('product.destroy');

    Route::get('/product/get/stats', [ProductController::class, 'stats'])->name('product.stats');

    //! END: PRODUCT REQUEST ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    Route::get('/supplier/get', [SupplierController::class, 'index'])->name('supplier.index');

    Route::get('/category/get', [CategoryController::class, 'index'])->name('category.index');
    Route::post('/category/create', [CategoryController::class, 'store'])->name('category.store');
    Route::delete('/category/delete/{id}', [CategoryController::class, 'destroy'])->name('category.destroy');
    Route::patch('category/update/{id}', [CategoryController::class, 'update'])->name('category.update');
    Route::get('/category/get/count', [CategoryController::class, 'get_count'])->name('category.get_count');
    
    Route::get('/position', [PositionController::class, 'index'])->name('position.index');
    Route::post('/position/create', [PositionController::class, 'store'])->name('position.store');
    Route::delete('/position/delete/{id}', [PositionController::class, 'destroy'])->name('position.destroy');
    Route::patch('/position/update/{id}', [PositionController::class, 'update'])->name('position.update');
    Route::patch('/position/update/permission/{id}', [PositionController::class, 'update_permission'])->name('position.update_permission');

    Route::get('/user/get', [UserController::class, 'index'])->name('user.index');
    Route::post('/user/create', [UserController::class, 'store'])->name('user.store');
    Route::patch('/user/update/permission/{id}', [UserController::class, 'update_permission'])->name('user.update_permission');
    Route::delete('/user/delete/{id}', [UserController::class, 'destroy'])->name('user.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
