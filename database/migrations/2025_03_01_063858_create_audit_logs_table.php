<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->nullable(); // Track who performed the action
            $table->string('action'); // "created", "updated", "deleted"
            $table->string('model'); // The model name, e.g., "Post", "User"
            $table->integer('model_id'); // The ID of the affected model
            $table->ipAddress('ip_address')->nullable(); // Capture user's IP
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
};
