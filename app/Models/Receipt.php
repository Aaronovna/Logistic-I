<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'status',
        'products',
        'supplier_id',
        'fleet',
        'order_date',
        'destination',
        'accepted',
    ];
}
