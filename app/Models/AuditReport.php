<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'details',
        'final_comment',
        'task_id',
        'review_status',
        'reviewed_by',
        'review_notes',
        'files'
    ];

    public function audit_task(){
        return $this->belongsTo(AuditTask::class);
    }
}
