<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Position extends Model
{
    use HasFactory, Auditable;

    protected $fillable = ['name', 'permissions'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($position) {
            if (is_null($position->permissions)) {
                $position->permissions = json_encode([
                    "101" => false,
                    "102" => false,
                    "103" => false,
                    "111" => false,
                    "112" => false,
                    "121" => false,
                    "122" => false,
                    "131" => false,
                    "132" => false,

                    "201" => false,
                    "202" => false,
                    "203" => false,

                    "301" => false,
                    "302" => false,
                    "311" => false,
                    "312" => false,
                    "321" => false,
                    "322" => false,
                    "331" => false,
                    "332" => false,
                    "341" => false,
                    "342" => false,
                    "351" => false,
                    "352" => false,

                    "401" => false,
                    "402" => false,
                    "411" => false,
                    "412" => false,

                    "501" => false,
                    "502" => false,
                    "511" => false,
                    "512" => false,
                    "521" => false,
                    "522" => false,
                ]);
            }
        });
    }
}
