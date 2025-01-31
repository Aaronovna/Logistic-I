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
        'description',
        'assigned_to',
        'assigned_by'
    ];

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
