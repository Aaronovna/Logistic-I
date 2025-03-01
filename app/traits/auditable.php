<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;


trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(function (Model $model) {
            logAudit(
                'created',
                class_basename($model),
                $model->id,
                "A new " . class_basename($model) . " with ID {$model->id} ({$model->name}) was created."
            );
        });

        static::updating(function (Model $model) {
            logAudit(
                'updated',
                class_basename($model),
                $model->id,
                "The " . class_basename($model) . " with ID {$model->id} ({$model->name}) was updated."
            );
        });

        static::deleted(function (Model $model) {
            logAudit(
                'deleted',
                class_basename($model),
                $model->id,
                "The " . class_basename($model) . " with ID {$model->id} ({$model->name}) was deleted."
            );
        });
    }
}
