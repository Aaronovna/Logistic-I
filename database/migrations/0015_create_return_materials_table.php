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
        Schema::create('return_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requested_by_id')->constrained('users');
            $table->foreignId('infrastructure_id')->constrained('infrastructures');
            $table->json('items')->nullable();
            $table->string('comment')->nullable();
            $table->string('status')->default('Waiting for Approval');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_materials');
    }
};
