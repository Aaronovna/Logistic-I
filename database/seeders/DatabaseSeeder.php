<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\User;
use App\Models\Product;
use App\Models\Infrastructure;
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
        
        Supplier::factory(10)->create();
        User::factory(6)->create();
        Product::factory(20)->create();
        Infrastructure::factory()->ofType(100)->create();
        Infrastructure::factory()->ofType(101)->create();
        Infrastructure::factory()->ofType(102)->create();
    }
}
