<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class File extends Model
{
    use HasFactory, Auditable;

    protected $fillable = ['name', 'path', 'type', 'size'];
}
