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
        Schema::create('audit_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type');
            $table->text('scope');
            $table->mediumText('description');
            $table->dateTime('startdate');
            $table->dateTime('deadline');
            $table->string('status')->default('Pending');
            $table->boolean('auto_gen')->default(false);
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('restrict');
            $table->string('priority')->default('unknown');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('audit_reports');
        Schema::dropIfExists('audit_tasks');
    }
};
