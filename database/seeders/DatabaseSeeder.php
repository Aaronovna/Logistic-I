<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\Batch;
use App\Models\User;
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
            
        ]);
        
        /* Supplier::factory(10)->create(); */
        User::factory(1)->create();
        Batch::factory(5)->create();
    }
}
