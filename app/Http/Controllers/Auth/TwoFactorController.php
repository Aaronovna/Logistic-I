<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function create()
    {
        return inertia('Auth/TwoFactorChallenge'); // This is your Vue/React page
    }

    public function store(Request $request)
    {
        $request->validate(['code' => 'required']);

        $user = auth()->user();

        if (
            $user->two_factor_code === $request->code &&
            $user->two_factor_expires_at->gt(now())
        ) {
            // Clear the 2FA code
            $user->two_factor_code = null;
            $user->two_factor_expires_at = null;
            $user->save();

            // Redirect to final destination
            return redirect()->intended('/');
        }

        return back()->withErrors(['code' => 'Invalid or expired code.']);
    }
}
