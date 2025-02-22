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
                    "101" => false,
                    "102" => false,
                    "111" => false,
                    "112" => false,
                    "121" => false,
                    "122" => false,
                    "131" => false,
                    "132" => false,

                    "201" => false,
                    "202" => false,
                    "203" => false,

                    "301" => false,
                    "302" => false,
                    "311" => false,
                    "312" => false,
                    "321" => false,
                    "322" => false,
                    "331" => false,
                    "332" => false,
                    "341" => false,
                    "342" => false,
                    "351" => false,
                    "352" => false,

                    "401" => false,
                    "402" => false,
                    "411" => false,
                    "412" => false,

                    "501" => false,
                    "502" => false,
                    "511" => false,
                    "512" => false,
                    "521" => false,
                    "522" => false,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
