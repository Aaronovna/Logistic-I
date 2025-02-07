<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Infrastructure>
 */
class InfrastructureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $images = [
            'https://media.istockphoto.com/id/457796927/photo/warehouse-building.jpg?s=612x612&w=0&k=20&c=7B89_PjoILSAGcoq7XZYkQsLfXRMOzDlxQlcbyVcWDw=',
            'https://www.electrive.com/media/2020/12/hamburger-hochbahn-busdepot-elektrobus-electric-bus-2020-01-min.png',
            'https://media.philstar.com/photos/2021/10/27/bus_2021-10-27_20-33-19.jpg'
        ];
        return [
            'type' => $this->faker->randomElement([100, 101, 102]),
            'name' => $this->faker->company,
            'address' => $this->faker->address,
            'access' => null,
            'image_url' => $this->faker->randomElement($images),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Custom state that accepts a specific type.
     */
    public function ofType(string $type): Factory
    {
        if (!in_array($type, [100, 101, 102])) {
            throw new \InvalidArgumentException("Invalid type: {$type}");
        }

        return $this->state([
            'type' => $type,
        ]);
    }
}
