<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'items', 'comment', 'status','requested_by_id','infrastructure_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'requested_by_id');
    }
    
    public function infrastructure()
    {
        return $this->belongsTo(Infrastructure::class, 'infrastructure_id');
    }
}
