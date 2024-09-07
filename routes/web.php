<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\BatchController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;

Route::redirect('/', 'login');

Route::middleware(["auth", "verified"])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/report', fn () => Inertia::render('Report'))->name('report');
    Route::get('/incoming', [Batchcontroller::class, 'index'])->name('incoming');
    Route::get('/product', [ProductController::class, 'index'])->name('product');
    Route::get('/category', [CategoryController::class, 'index'])->name('category');
    
    Route::get('/category/get/count', [CategoryController::class, 'getCount'])->name('category.getCount');
    Route::post('/category', [CategoryController::class, 'store'])->name('category.store');
    Route::delete('/category/delete/{id}', [CategoryController::class, 'destroy'])->name('category.destroy');
    Route::patch('category/update/{id}', [CategoryController::class, 'update'])->name('category.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
