<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DispatchTrailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch all products
        $products = Product::all();

        if ($products->isEmpty()) {
            echo "No products found in the database. Please seed the products table first.";
            return; // Exit if no products are available
        }

        // Set the number of records to insert (e.g., 1000 records)
        $recordCount = 1000;
        $dispatchTrails = [];

        // Define the range for the random date (1 year ago to now)
        $startDate = Carbon::now()->subYear();  // 1 year ago from now
        $endDate = Carbon::now();  // current date and time

        // Loop to create the records
        for ($i = 0; $i < $recordCount; $i++) {
            // Generate a random date between $startDate and $endDate for created_at and updated_at
            $randomDate = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));

            $dispatchTrails[] = [
                'request_id' => null, // No request linked (or add logic for a valid request_id)
                'product_id' => $products->random()->id, // Select a random product
                'quantity' => rand(1, 100), // Random quantity between 1-100
                'created_at' => $randomDate, // Random created_at
                'updated_at' => $randomDate, // Random updated_at (you can adjust this if needed)
            ];
        }

        // Insert all dispatch trails in one go
        DB::table('dispatch_trails')->insert($dispatchTrails);

        echo "$recordCount dispatch trail records have been inserted.";
    }
}
