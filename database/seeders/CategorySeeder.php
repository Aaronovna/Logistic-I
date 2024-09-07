<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Bus Parts and Components',
            'Maintenance Supplies',
            'Operational Supplies',
            'Bus Accessories',
            'Documentation and Records',
            'Fuel and Fluids',
            'Packaging Materials',
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category,
                'description' => fake()->realText(100),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
