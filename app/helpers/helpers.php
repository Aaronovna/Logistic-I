<?php
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

if (!function_exists('logAudit')) {
    function logAudit($action, $model, $modelId)
    {
        AuditLog::create([
            'user_id'   => Auth::id(), // Get the authenticated user
            'action'    => $action,
            'model'     => $model,
            'model_id'  => $modelId,
            'ip_address'=> Request::ip(), // Capture the user's IP
        ]);
    }
}
