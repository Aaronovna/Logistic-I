<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'task_id',
        'status',
        'products',
        'supplier',
        'fleet',
        'order_date',
        'warehouse_id',
        'accepted',
    ];

    public function audit_task()
    {
        return $this->belongsTo(AuditTask::class, 'task_id');
    }
    public function warehouse()
    {
        return $this->belongsTo(Infrastructure::class, 'warehouse_id');
    }
}
