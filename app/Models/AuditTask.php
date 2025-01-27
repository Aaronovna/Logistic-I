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
        'description',
        'auditor_id'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
