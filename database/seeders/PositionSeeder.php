<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            "Inventory Control Manager",
            "Warehouse Manager",
            "Inventory Analyst",
            "Logistics Coordinator",
            "Inventory Specialist",
            "Warehouse Supervisor",
            "Inventory Clerk",
            "Warehouse Operations Manager",
            "Audit and Compliance Manager",
            "Warehouse Auditor",
            "Logistics Auditor",
            "Inventory Control Supervisor",
            "Supply Chain Auditor",
            "Inventory Control Coordinator",
            "Stock Controller",
            "Warehouse Lead",
            "Quality Assurance Auditor",
            "Warehouse Associate",
            "Inventory Planner",
            "Materials Manager",
            "Inventory Auditor",
            "Warehouse Inventory Manager",
            "Logistics Manager",
            "Stockroom Supervisor",
            "Inventory Data Analyst",
            "Warehouse Quality Inspector",
            "Audit Supervisor (Warehouse/Inventory)",
            "Inventory Control Auditor",
            "Maintenance Executive",
            "Logisitic Operator",
            "Maintenance Planner",
            "Maintenance Supervisor",
        ];

        foreach ($positions as $position) {
            DB::table('positions')->insert([
                'name' => $position,
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
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
