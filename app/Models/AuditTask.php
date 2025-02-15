<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditTask extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'type',
        'status',
        'scope',
        'startdate',
        'deadline',
        'description',
        'assigned_to',
        'assigned_by'
    ];

    public function auditReport()
    {
        return $this->hasOne(AuditReport::class, 'task_id');
    }

    public function assignedToUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Relationship for the user who assigned the task
    public function assignedByUser()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
