<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\File;

class FileController extends Controller
{
    public function index()
    {
        $files = File::all()->map(function ($file) {
            return [
                'id' => $file->id,
                'name' => $file->name,
                'type' => $file->type,
                'size' => $file->size,
                'url' => asset("storage/{$file->path}")
            ];
        });

        return response()->json(['data' => $files], 200);
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'files.*' => 'required|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:102400', // 100MB per file
        ]);

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {

            $path = $file->store('uploads', 'public');

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

        return response()->json(['message' => 'Files uploaded successfully', 'data' => $uploadedFiles,], 201);
    }

    public function show($id)
    {
        $selectedFile = File::find($id);

        if (!$selectedFile) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $file = [
            'id' => $selectedFile->id,
            'name' => $selectedFile->name,
            'type' => $selectedFile->type,
            'size' => $selectedFile->size,
            'url' => asset("storage/{$selectedFile->path}")
        ];

        return response()->json(['data' => $file], 200);
    }

    public function destroy($id)
    {
        $file = File::find($id);

        if (!$file) {
            return response()->json(['message' => 'File not found'], 404);
        }

        Storage::disk('public')->delete($file->path);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
    }
}
