<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class RequestMaterial extends Model
{
    use HasFactory, Auditable;

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

    public function dispatch()
    {
        return $this->hasOne(DispatchMaterial::class);
    }
}
