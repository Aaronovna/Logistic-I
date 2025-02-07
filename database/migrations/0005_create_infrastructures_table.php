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
        Schema::create('infrastructures', function (Blueprint $table) {
            $table->id();
            $table->integer('type')->nullable();
            $table->string('name');
            $table->string('address');
            $table->json('access')->nullable();
            $table->string('image_url');
            $table->timestamps();
            //$table->decimal('lng',10,7)->nullable();
            //$table->decimal('lat',10,7)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
        Schema::dropIfExists('requests');
        Schema::dropIfExists('infrastructures');
    }
};
