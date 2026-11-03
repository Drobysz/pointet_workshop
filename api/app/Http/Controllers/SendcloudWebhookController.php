<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SendcloudWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // TODO: Verify the Sendcloud-Signature before processing real webhook events.

        return response()->json(['success' => true]);
    }
}
