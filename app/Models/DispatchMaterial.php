<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispatchMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'type',
    ];

    public function infrastructure()
    {
        return $this->belongsTo(RequestMaterial::class);
    }
}
