<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $userIndex = 0;  // This will help keep track of which user to generate next.

        $users = [
            [
                'name' => 'Ashleigh Koepp',
                'email' => 'ashleigh.koepp@example.net',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'permissions' => json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,
                ]),
                'type' => 2050,
            ],
            [
                'name' => 'Ricardo Aron III',
                'email' => 'aroniii.ricardo@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'permissions' => json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,
                ]),
                'type' => 2051,
            ],
            [
                'name' => 'Kent Mark Tejada',
                'email' => 'strawberrymilkchicken@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'permissions' => json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,
                ]),
                'type' => 2052,
            ],
            [
                'name' => 'Kristel Casinillo',
                'email' => 'casinillokristeldc17@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'permissions' => json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,
                ]),
                'type' => 2053,
            ],
            [
                'name' => 'John Vincent Dizon',
                'email' => 'shotoooh123@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'permissions' => json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,
                ]),
                'type' => 2054,
            ],
            [
                'name' => 'Andy Barrantes',
                'email' => 'marshallgustavo96@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'permissions' => json_encode([
                    "100" => false,
                    "101" => false,
                    "150" => false,
                    "151" => false,
                    "200" => false,
                    "201" => false,
                    "250" => false,
                    "251" => false,
                ]),
                'type' => 2055,
            ],
        ];

        $user = $users[$userIndex];
        $userIndex = ($userIndex + 1) % count($users);

        return $user;
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
