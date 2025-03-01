<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class DispatchMaterial extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'request_id',
        'type',
    ];

    public function infrastructure()
    {
        return $this->belongsTo(RequestMaterial::class);
    }
}
