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
        Schema::create('audit_reports', function (Blueprint $table) {
            $table->id();
            $table->string('location');
            $table->string('details');
            $table->string('final_comment');
            $table->foreignId('task_id')->constrained('audit_tasks')->onDelete('restrict');
            $table->string('review_status')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->string('review_notes')->nullable();
            $table->json('files')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_reports');
    }
};