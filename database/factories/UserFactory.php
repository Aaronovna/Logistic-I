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
        ],
        [
            'name' => 'Aaronovna Scitus',
            'email' => 'aaronovna.scitus@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ],
    ];

    // Ensure the index alternates between the two users
    $user = $users[$userIndex];
    $userIndex = ($userIndex + 1) % count($users);  // This will keep alternating between 0 and 1

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
