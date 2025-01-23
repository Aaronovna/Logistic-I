<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'infrastructure_id',
        'user_id',
        'status',
        'type',
        'items'
    ];

    public function infrastructure()
    {
        return $this->belongsTo(Infrastructure::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
