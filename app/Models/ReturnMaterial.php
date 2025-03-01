<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class ReturnMaterial extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'return_id', 'name', 'quantity','unit','category'
    ];
    
    public function request()
    {
        return $this->belongsTo(ReturnRequest::class, 'request_id');
    }
}

