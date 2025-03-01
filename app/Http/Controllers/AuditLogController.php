<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    public function show(string $model)
    {
        // Fetch logs based on model name
        $logs = AuditLog::where('model', $model)->orderBy('created_at', 'desc')->get();

        // Check if logs exist
        if ($logs->isEmpty()) {
            return response()->json(['message' => 'No logs found for this model'], 404);
        }

        return response()->json(['data' => $logs], 200);
    }
}
