<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;
use App\Models\Supplier;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category_id = Category::inRandomOrder()->first()->id;
        $supplier_id = Supplier::inRandomOrder()->first()->id;

        return [
            'category_id' => $category_id,
            'supplier_id' => $supplier_id,
            'name' => $this->faker->word,
            'brand' => $this->faker->company,
            'model' => $this->faker->bothify('Model-####'),
            'description' => $this->faker->sentence,
            'stock' => $this->faker->numberBetween(1, 99),
            'restock_point' => $this->faker->randomElement([10, 20, 30, 40, 50]),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
