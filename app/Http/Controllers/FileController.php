<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\File;

class FileController extends Controller
{

    // Fetch all uploaded files
    public function index()
    {
        return File::all()->map(function ($file) {
            return [
                'id' => $file->id,
                'name' => $file->name,
                'type' => $file->type,
                'size' => $file->size,
                'url' => asset("storage/{$file->path}")
            ];
        });
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files.*' => 'required|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:102400', // 100MB per file
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('uploads', 'public');

            // Save file details to the database
            $fileRecord = File::create([
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            $uploadedFiles[] = [
                'id' => $fileRecord->id,
                'name' => $fileRecord->name,
                'type' => $fileRecord->type,
                'size' => $fileRecord->size,
                'url' => asset("storage/{$fileRecord->path}"),
            ];
        }

        return response()->json([
            'message' => 'Files uploaded successfully',
            'files' => $uploadedFiles
        ]);
    }

    public function show($id)
    {
        $file = File::find($id);

        if (!$file) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return response()->json([
            'id' => $file->id,
            'name' => $file->name,
            'type' => $file->type,
            'size' => $file->size,
            'url' => asset("storage/{$file->path}")
        ]);
    }

    // Delete a file
    public function destroy($id)
    {
        $file = File::find($id);
        if (!$file) {
            return response()->json(['error' => 'File not found'], 404);
        }

        Storage::disk('public')->delete($file->path);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
    }
}
