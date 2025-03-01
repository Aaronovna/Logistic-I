<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class AuditReport extends Model
{
    use HasFactory, Auditable;

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
        return $this->belongsTo(AuditTask::class, 'task_id');
    }
}
