<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditTask;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with(['position'])->get();
        return response()->json(['data' => $users], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        return response()->json(['message' => 'User created successfully', 'data' => $user], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json(['data' => $user], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validatedData = $request->validate([
            'position_id' => 'required|exists:positions,id',
        ]);

        $user->update($validatedData);

        return response()->json(['message' => 'User updated successfully', 'data' => $user], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    public function autoAssignAuditor()
    {
        // Step 1: Fetch auditors with their active task count (non-completed tasks)
        $auditors = User::where('type', 2055)
            ->withCount([
                'auditTasks' => function ($query) {
                    $query->where('status', '!=', 'Completed');
                }
            ])
            ->orderBy('audit_tasks_count', 'asc')
            ->get();

        // Step 2: Get the last assigned auditor
        $lastAssignedAuditor = AuditTask::whereNotNull('assigned_to')
            ->latest('updated_at')
            ->value('assigned_to');

        // Step 3: Apply round-robin fallback to avoid repeated assignments
        $selectedAuditor = $auditors->firstWhere('id', '>', $lastAssignedAuditor) ?? $auditors->first();

        if (!$selectedAuditor) {
            return response()->json(['error' => 'No available auditor'], 404);
        }

        return response()->json(['data' => $selectedAuditor], 200);
    }
}
