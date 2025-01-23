<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Infrastructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'name', 'address', 'access', 'image_url'
    ];

    public function request()
    {
        return $this->hasMany(RequestMaterial::class);
    }
}
