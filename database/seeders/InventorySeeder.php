<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Infrastructure;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $warehouses = Infrastructure::where('type', 100)->get(); // Assuming 'infrastructures' contains warehouses

        if ($products->isEmpty() || $warehouses->isEmpty()) {
            echo "No products or warehouses found. Please seed the products and infrastructures tables first.";
            return;
        }

        $inventoryRecords = [];
        $recordCount = 500; // Adjust the number of records as needed

        // Define the range for the random date (1 year ago to now)
        $startDate = Carbon::now()->subYear(); // 1 year ago from now
        $endDate = Carbon::now(); // current date and time

        for ($i = 0; $i < $recordCount; $i++) {
            // Generate a random date between $startDate and $endDate
            $randomDate = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));

            $inventoryRecords[] = [
                'product_id' => $products->random()->id,
                'warehouse_id' => $warehouses->random()->id,
                'quantity' => rand(10, 500), // Random quantity between 10 and 500
                'created_at' => $randomDate,
                'updated_at' => $randomDate,
            ];
        }

        DB::table('inventories')->insert($inventoryRecords);

        echo "$recordCount inventory records have been inserted.\n";
    }
}
