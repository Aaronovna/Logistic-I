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
        return $users;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User created successfully',
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate incoming request
        $validated = $request->validate([
            'position_id' => 'required|exists:positions,id',
        ]);

        // Find user by ID or fail
        $user = User::findOrFail($id);

        // Update user's position_id
        $user->position_id = $validated['position_id'];
        $user->save(); // Now actually saving changes

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user // Returning updated user data
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
    }

    public function autoAssignAuditor()
    {
        // Step 1: Fetch auditors with their active task count (non-completed tasks)
        $auditors = User::where('type', 2055) // Auditor type = 2055
            ->withCount([
                'auditTasks' => function ($query) {
                    $query->where('status', '!=', 'Completed'); // Count non-completed tasks only
                }
            ])
            ->orderBy('audit_tasks_count', 'asc') // Fewest tasks first
            ->get();

        // Step 2: Get the last assigned auditor
        $lastAssignedAuditor = AuditTask::whereNotNull('assigned_to')
            ->latest('updated_at') // Use updated_at for most recent task
            ->value('assigned_to');

        // Step 3: Apply round-robin fallback to avoid repeated assignments
        $selectedAuditor = $auditors->firstWhere('id', '>', $lastAssignedAuditor) ?? $auditors->first();

        // Final check
        if (!$selectedAuditor) {
            return response()->json(['error' => 'No available auditor'], 404);
        }

        return $selectedAuditor->id;
    }
}
