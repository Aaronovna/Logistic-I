<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Product extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'name',
        'model',
        'brand',
        'description',
        'image_url',
        'price',
        'stock',
        'restock_point',
        'category_id',
        'supplier_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }
}
