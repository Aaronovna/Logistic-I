<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail;
use App\Mail\TwoFactorCode;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Save code and expiration
        $user->two_factor_code = rand(100000, 999999);
        $user->two_factor_expires_at = now()->addMinutes(10);
        $user->save();

        // Send code to email
        Mail::to($user->email)->send(new TwoFactorCode($user));

        // Log out temporarily and store ID in session for 2FA
        Auth::logout();
        $request->session()->put('2fa:user:id', $user->id);

        return response()->json(['twofa' => true]);
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    protected function determineRedirection($user): ?string
    {
        if ($user->type === 2052) {
            return route('dashboard');
        } //inventory

        if ($user->type === 2053) {
            return route('depot');
        }  //infrastructure

        if ($user->type === 2054 || $user->type === 2055) {
            return route('tasks');
        } //audit

        return null;
    }

    public function verify2fa(Request $request)
    {
        $request->validate(['code' => 'required']);

        $userId = $request->session()->get('2fa:user:id');

        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Session expired. Please log in again.'], 419);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        // Rate limit check
        $key = '2fa-attempts:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Too many attempts. Try again in $seconds seconds."
            ], 429);
        }

        // Increment attempts
        RateLimiter::hit($key, 60); // Limit resets after 60 seconds

        if (
            $user->two_factor_code === $request->code &&
            $user->two_factor_expires_at->gt(now())
        ) {
            // Clear code and rate limiter
            $user->two_factor_code = null;
            $user->two_factor_expires_at = null;
            $user->save();
            RateLimiter::clear($key);

            Auth::login($user);
            $request->session()->forget('2fa:user:id');

            return response()->json(['success' => true, 'user_type' => $user->type]);
        }

        return response()->json(['success' => false, 'message' => 'Invalid or expired code.'], 422);
    }

    public function resend2faCode(Request $request)
    {
        $userId = $request->session()->get('2fa:user:id');

        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Session expired. Please log in again.'], 419);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        // Update code and expiration
        $user->two_factor_code = rand(100000, 999999);
        $user->two_factor_expires_at = now()->addMinutes(10);
        $user->save();

        Mail::to($user->email)->send(new TwoFactorCode($user));

        return response()->json(['success' => true, 'message' => 'A new 2FA code has been sent.']);
    }
}
