<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\User;
use App\Models\Position;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            PositionSeeder::class,
        ]);
        
        /* Supplier::factory(10)->create(); */
        User::factory(2)->create();
    }
}
