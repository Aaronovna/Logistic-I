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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->integer('order_id')->unique();
            $table->string('status');
            $table->json('products')->nullable();
            $table->integer('supplier_id');
            $table->string('fleet');
            $table->datetime('order_date');
            $table->string('destination');
            $table->boolean('accepted')->default(false);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE receipts AUTO_INCREMENT = 100000;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
