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
            return 'High'; // Fast-moving product, selling quickly
        } elseif ($turnover >= 3 && $turnover <= 6) {
            return 'Moderate'; // Balanced inventory, good sales rate
        } else {
            return 'Low'; // Slow-moving product, potential overstock
        }
    }

    public function getCriticalLevel($productId)
    {
        // Define a default minimum lead time (in days) if not stored elsewhere
        $minimumLeadTime = 2; // Assume 2 days for now

        // Calculate Minimum Usage (lowest daily usage in the last 30 days)
        $startDate = Carbon::now()->subDays(30);

        $dailyUsage = InventoryTrail::where('product_id', $productId)
            ->where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(function ($entry) {
                return Carbon::parse($entry->created_at)->format('Y-m-d');
            })
            ->map(function ($entries) {
                return $entries->sum(function ($entry) {
                    return $entry->operation === 'subtract' ? $entry->quantity : 0;
                });
            });

        // Get the minimum daily usage, default to 1 if no data
        $minimumUsage = $dailyUsage->filter()->min() ?? 1;

        // Calculate Critical Level
        $criticalLevel = $minimumUsage * $minimumLeadTime;

        return response()->json([
            'product_id' => $productId,
            'minimum_usage' => $minimumUsage,
            'minimum_lead_time' => $minimumLeadTime,
            'critical_level' => $criticalLevel
        ]);
    }

    public function getReorderPoint($productId)
    {
        // Define a default lead time (in days)
        $leadTime = 5; // Assume 5 days for now

        // Calculate Average Daily Usage (last 30 days)
        $startDate = Carbon::now()->subDays(30);

        $dailyUsage = InventoryTrail::where('product_id', $productId)
            ->where('created_at', '>=', $startDate)
            ->get()
            ->groupBy(function ($entry) {
                return Carbon::parse($entry->created_at)->format('Y-m-d');
            })
            ->map(function ($entries) {
                return $entries->sum(function ($entry) {
                    return $entry->operation === 'subtract' ? $entry->quantity : 0;
                });
            });

        // Get the average daily usage, default to 1 if no data
        $averageDailyUsage = $dailyUsage->filter()->avg() ?? 1;

        // Calculate Safety Stock (20% of demand during lead time)
        $safetyStock = ($averageDailyUsage * $leadTime) * 0.2;

        // Calculate Reorder Point
        $reorderPoint = ($averageDailyUsage * $leadTime) + $safetyStock;

        return response()->json([
            'product_id' => $productId,
            'average_daily_usage' => $averageDailyUsage,
            'lead_time' => $leadTime,
            'safety_stock' => $safetyStock,
            'reorder_point' => $reorderPoint
        ]);
    }
}
