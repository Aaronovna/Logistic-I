<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\User;
use App\Models\Product;
use App\Models\Infrastructure;
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
        Product::factory(20)->create();
        User::factory(7)->create();
        
        //$this->call(DispatchTrailSeeder::class);


        Infrastructure::factory(2)->ofType(100)->create();
        Infrastructure::factory(2)->ofType(101)->create();
        Infrastructure::factory(2)->ofType(102)->create();
    }
}
