<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dispatch_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('request_materials')->onDelete('restrict');
            $table->string('type');
            $table->timestamps();
        });

        Schema::create('dispatch_trails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->nullable()->constrained('request_materials')->onDelete('set null');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->integer('quantity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_materials');
        Schema::dropIfExists('dispatch_trails');
    }
};
