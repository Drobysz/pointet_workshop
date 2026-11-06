<?php

namespace App\Http\Controllers;

use App\Enums\SellerApplicationStatus;
use App\Http\Requests\ReviewSellerApplicationRequest;
use App\Http\Requests\SellerApplicationRequest;
use App\Http\Resources\SellerApplicationResource;
use App\Models\SellerApplication;
use App\Services\SellerApplications\SellerApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SellerApplicationController extends Controller
{
    public function __construct(private readonly SellerApplicationService $applications) {}

    public function store(SellerApplicationRequest $request): JsonResponse
    {
        $application = $this->applications->submit($request->validated());
        // Public retries return the submission acknowledgment without exposing review data.
        $application->forceFill([
            'status' => SellerApplicationStatus::Processing,
            'reviewed_at' => null,
            'response_message' => null,
        ]);

        return (new SellerApplicationResource($application))
            ->response()
            ->setStatusCode(201);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()->isAdmin(), 403);
        $filters = $request->validate([
            'status' => ['nullable', 'in:processing,approved,declined'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return SellerApplicationResource::collection(
            SellerApplication::query()
                ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
                ->latest()
                ->paginate($filters['per_page'] ?? 20)
                ->withQueryString(),
        );
    }

    public function show(Request $request, SellerApplication $sellerApplication): SellerApplicationResource
    {
        abort_unless($request->user()->isAdmin(), 403);

        return new SellerApplicationResource($sellerApplication);
    }

    public function respond(ReviewSellerApplicationRequest $request, SellerApplication $sellerApplication): SellerApplicationResource
    {
        abort_unless($request->user()->isAdmin(), 403);
        $data = $request->validated();

        return new SellerApplicationResource($this->applications->review(
            $sellerApplication,
            $request->user(),
            $data['approved'],
            $data['response'],
        ));
    }
}
