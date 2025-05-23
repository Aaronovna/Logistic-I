<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('restrict');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('restrict');
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->mediumText('description')->nullable();
            $table->mediumText('image_url')->nullable();
            $table->decimal('price')->nullable();
            $table->integer('restock_point')->nullable();
            $table->boolean('auto_replenish')->default(false);
            $table->boolean('perishable')->default(false);
            $table->integer('shelf_life')->nullable();
            $table->timestamps();
        });

        DB::statement('ALTER TABLE products AUTO_INCREMENT = 100000;');
    } 

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_trails');
        Schema::dropIfExists('products');
    }
};
