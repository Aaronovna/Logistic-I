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
        $users = User::select('id', 'name', 'email', 'email_verified_at', 'permissions', 'type')->get();
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
    }

    public function update_permission(Request $request, string $id)
    {
        // Validate the request input
        $request->validate([
            'permissions' => 'required|array', // Ensure 'permissions' is an array
            'permissions.*' => 'array', // Each item in the 'permissions' array should be an array
            'permissions.*.*' => 'boolean' // Each value in the array should be a boolean
        ]);

        // Find the user by ID
        $user = User::findOrFail($id); // Throws 404 if the user is not found

        // Retrieve the permissions from the request
        $newPermissions = $request->input('permissions');

        // Process the permissions data
        $processedPermissions = [];
        foreach ($newPermissions as $permission) {
            // Each item is an associative array like ["100" => false]
            foreach ($permission as $key => $value) {
                $processedPermissions[$key] = $value;
            }
        }

        // Update the user's permissions
        $user->permissions = $processedPermissions;

        // Save the updated user
        $user->save();

        // Return success response
        return response()->json([
            'message' => 'User permissions updated successfully!',
            'permissions' => $user->permissions
        ], 200);
    }

    public function get_permissions(string $id)
    {
        // Find the user by ID
        $user = User::findOrFail($id); // Throws 404 if user is not found

        // Retrieve the permissions from the user
        $permissions = $user->permissions;

        // Format the permissions to match the exact structure sent
        $formattedPermissions = [];
        foreach ($permissions as $key => $value) {
            $formattedPermissions[] = [$key => $value];
        }

        // Return the formatted permissions as JSON
        return response()->json([
            'permissions' => $formattedPermissions
        ], 200);
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
