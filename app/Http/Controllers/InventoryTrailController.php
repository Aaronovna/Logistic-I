<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\InventoryTrail;

class InventoryTrailController extends Controller
{
    /**
     * Store a new inventory trail log.
     */
    public function storeTrail($userId, $productId, $quantity, $operation, $log, $isUpdate = false)
    {
        try {
            InventoryTrail::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'operation' => $operation,
                'log' => $log,
                'update' => $isUpdate,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to store inventory trail'], 500);
        }
    }

    /**
     * Calculate the Average Inventory for a product over a period.
     * Formula: (Beginning Inventory + Ending Inventory) / 2
     */
    public function averageInventory($productId, $days)
    {
        $startDate = now()->subDays($days);
        $endDate = now();

        // Get the beginning inventory (first record in the period)
        $beginningInventory = InventoryTrail::where('product_id', $productId)
            ->whereDate('created_at', '>=', $startDate)
            ->orderBy('created_at', 'asc')
            ->value('quantity') ?? 0;

        // Get the ending inventory (latest record in the period)
        $endingInventory = InventoryTrail::where('product_id', $productId)
            ->whereDate('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc')
            ->value('quantity') ?? 0;

        // Calculate Average Inventory
        $averageInventory = ($beginningInventory + $endingInventory) / 2;

        return response()->json([
            'product_id' => $productId,
            'average_inventory' => $averageInventory,
            'beginning_inventory' => $beginningInventory,
            'ending_inventory' => $endingInventory,
            'period' => $days . ' days',
        ]);
    }


    /**
     * Get Beginning Inventory for a product in a given period.
     */
    public function getBeginningInventory($productId, $days)
    {
        $startDate = Carbon::now()->subDays($days);
        $inventory = InventoryTrail::where('product_id', $productId)
            ->where('created_at', '<', $startDate)
            ->get();

        return $inventory->sum(function ($entry) {
            return $entry->operation === 'add' ? $entry->quantity : -$entry->quantity;
        });
    }

    /**
     * Get Purchases (added inventory) within a given period.
     */
    public function getPurchases($productId, $days)
    {
        $startDate = Carbon::now()->subDays($days);
        $purchases = InventoryTrail::where('product_id', $productId)
            ->where('created_at', '>=', $startDate)
            ->where('operation', 'add')
            ->sum('quantity');

        return $purchases;
    }

    /**
     * Get Ending Inventory for a product in a given period.
     */
    public function getEndingInventory($productId)
    {
        $inventory = InventoryTrail::where('product_id', $productId)->get();

        return $inventory->sum(function ($entry) {
            return $entry->operation === 'add' ? $entry->quantity : -$entry->quantity;
        });
    }

    /**
     * Calculate COGS for a given product and period.
     */
    public function calculateCOGS($productId, $days)
    {
        $beginningInventory = $this->getBeginningInventory($productId, $days);
        $purchases = $this->getPurchases($productId, $days);
        $endingInventory = $this->getEndingInventory($productId);

        $cogs = $beginningInventory + $purchases - $endingInventory;

        return response()->json([
            'product_id' => $productId,
            'period_days' => $days,
            'beginning_inventory' => $beginningInventory,
            'purchases' => $purchases,
            'ending_inventory' => $endingInventory,
            'cogs' => $cogs
        ]);
    }

    public function inventoryTurnover($productId, $days)
    {
        // Get COGS (Total quantity removed from inventory in the given period)
        $COGS = InventoryTrail::where('product_id', $productId)
            ->where('operation', 'subtract')
            ->whereDate('created_at', '>=', now()->subDays($days))
            ->sum('quantity');

        // Get Average Inventory
        $averageInventoryResponse = $this->averageInventory($productId, $days);
        $averageInventoryData = $averageInventoryResponse->getData();
        $averageInventory = $averageInventoryData->average_inventory ?? 1; // Prevent division by zero

        // Calculate Inventory Turnover Ratio
        $inventoryTurnover = $COGS / max($averageInventory, 1); // Prevent division by zero

        // Categorizing the turnover rate
        $turnoverCategory = $this->classifyTurnover($inventoryTurnover);

        return response()->json([
            'product_id' => $productId,
            'inventory_turnover' => $inventoryTurnover,
            'cogs' => $COGS,
            'average_inventory' => $averageInventory,
            'period' => $days . ' days',
            'turnover_category' => $turnoverCategory,
        ]);
    }

    /**
     * Classify Inventory Turnover as High, Moderate, or Low.
     */ 
    private function classifyTurnover($turnover)
    {
        if ($turnover > 6) {
            return 'High Turnover'; // Fast-moving product, selling quickly
        } elseif ($turnover >= 3 && $turnover <= 6) {
            return 'Moderate Turnover'; // Balanced inventory, good sales rate
        } else {
            return 'Low Turnover'; // Slow-moving product, potential overstock
        }
    }
}
