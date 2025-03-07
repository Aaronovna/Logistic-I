<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
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
            "Logistic Operator",
            "Maintenance Planner",
            "Maintenance Supervisor",
        ];

        $permissions = [
            "101", "102", "103", "111", "112", "121", "122", "131", "132", 
            "201", "202", "203", 
            "301", "302", "311", "312", "321", "322", "331", "332", "341", "342", "351", "352",
            "401", "402", "411", "412", 
            "501", "502", "511", "512", "521", "522"
        ];

        DB::table('positions')->insert([
            'name' => "Super Admin",
            'permissions' => json_encode(array_fill_keys($permissions, true)),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($positions as $position) {
            DB::table('positions')->insert([
                'name' => $position,
                'permissions' => json_encode(array_fill_keys($permissions, false)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
