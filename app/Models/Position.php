<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'permissions'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($position) {
            if (is_null($position->permissions)) {
                $position->permissions = json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,

                    "2050" => false,
                    "2051" => false,
                    "2052" => false,
                    "2053" => false,
                    "2054" => false,
                    "2055" => true,
                ]);
            }
        });
    }
}
