<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Infrastructure extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'type', 'name', 'address', 'access', 'image_url', 'lng', 'lat'
    ];

    public function request()
    {
        return $this->hasMany(RequestMaterial::class);
    }
}
