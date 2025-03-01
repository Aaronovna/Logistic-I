<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Inventory extends Model
{
    use HasFactory, Auditable;
    protected $fillable = [
        'quantity',
        'status',
        'product_id',
        'warehouse_id'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function warehouse()
    {
        return $this->belongsTo(Infrastructure::class);
    }
}
