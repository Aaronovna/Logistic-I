<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\Product;

class InventoryTrailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch all products and users
        $products = Product::all();
        if ($products->isEmpty()) {
            echo "No products found in the database. Please seed the products table first.";
            return; // Exit if no products are available
        }

        // Number of records to insert
        $recordCount = 1000;
        $inventoryTrails = [];

        // Define the range for the random date (1 year ago to now)
        $startDate = Carbon::now()->subYear();
        $endDate = Carbon::now();

        // Possible operations
        $operations = ['add', 'subtract'];

        // Loop to create records
        for ($i = 0; $i < $recordCount; $i++) {
            $randomDate = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));
            $operation = $operations[array_rand($operations)];

            $inventoryTrails[] = [
                'user_id' => null,
                'product_id' => $products->random()->id, // Select a random product
                'quantity' => rand(1, 100), // Random quantity between 1-100
                'operation' => $operation, // Random operation
                'update' => true,
                'created_at' => $randomDate,
                'updated_at' => $randomDate,
            ];
        }

        // Insert all inventory trails in one go
        DB::table('inventory_trails')->insert($inventoryTrails);

        echo "$recordCount inventory trail records have been inserted.";
    }
}
