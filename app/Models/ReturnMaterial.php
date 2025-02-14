<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'return_id', 'name', 'quantity','unit','category'
    ];
    
    public function request()
    {
        return $this->belongsTo(ReturnRequest::class, 'request_id');
    }
}

