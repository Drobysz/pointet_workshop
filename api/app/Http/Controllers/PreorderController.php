<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreorderRequest;
use App\Http\Requests\UpdatePreorderRequest;
use App\Http\Resources\PreorderAnalyticsResource;
use App\Http\Resources\PreorderCheckoutSessionResource;
use App\Http\Resources\PreorderResource;
use App\Models\Preorder;
use App\Enums\PreorderPaymentStatus;
use App\Services\Checkout\GuestSessionService;
use App\Services\Checkout\PreorderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PreorderController extends Controller
{
    private const REGISTER_RELATIONS = ['registers.good.images', 'registers.inventory'];

    public function __construct(private readonly PreorderService $preorders) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'user_id' => ['nullable', 'integer'],
            'payment_status' => ['nullable', 'in:pending,paid,failed,canceled,refunded'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = Preorder::query()->with(self::REGISTER_RELATIONS);
        // A Preorder is a confirmed demand signal. Failed or abandoned Stripe
        // attempts live only in preorder_checkout_sessions and are never listed.
        $query->where('payment_status', PreorderPaymentStatus::Paid->value);

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        } elseif ($filters['user_id'] ?? null) {
            $query->where('user_id', $filters['user_id']);
        }
        if ($filters['payment_status'] ?? null) {
            $query->where('payment_status', $filters['payment_status']);
        }
        if ($filters['search'] ?? null) {
            $search = $filters['search'];
            $query->where(function (Builder $inner) use ($search): void {
                $inner->where('id', ctype_digit($search) ? (int) $search : -1)
                    ->orWhereRaw('LOWER(customer_email) LIKE ?', ['%'.mb_strtolower($search).'%']);
            });
        }

        return PreorderResource::collection(
            $query->latest()->paginate($filters['per_page'] ?? 20)->withQueryString(),
        );
    }

    public function show(Preorder $preorder): PreorderResource
    {
        $this->authorize('view', $preorder);

        return new PreorderResource($preorder->load(self::REGISTER_RELATIONS));
    }

    public function store(PreorderRequest $request): JsonResponse
    {
        $user = $request->user();
        $guest = $user ? null : app(GuestSessionService::class)->resolveOrCreate($request);
        $checkout = $this->preorders->startCheckoutFromBasket(
            $user,
            $guest['session'] ?? null,
            $request->validated('idempotency_key'),
            $request->validated('items', []),
            $request->validated('email'),
        );
        $response = (new PreorderCheckoutSessionResource($checkout))->response($request);
        if (isset($guest['cookie']) && $guest['cookie']) {
            $response->withCookie($guest['cookie']);
        }

        return $response;
    }

    public function guestIndex(Request $request, GuestSessionService $guests): AnonymousResourceCollection
    {
        $filters = $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $session = $guests->resolve($request);
        if (! $session) {
            return PreorderResource::collection(Preorder::query()->whereRaw('1 = 0')->paginate($filters['per_page'] ?? 20));
        }

        return PreorderResource::collection(
            Preorder::query()
                ->with(self::REGISTER_RELATIONS)
                ->whereNull('user_id')
                ->where('guest_session_id', $session->id)
                ->where('payment_status', PreorderPaymentStatus::Paid->value)
                ->latest()
                ->paginate($filters['per_page'] ?? 20)
                ->withQueryString(),
        );
    }

    public function guestShow(int $preorderId, Request $request, GuestSessionService $guests): PreorderResource
    {
        $session = $guests->resolve($request);
        $preorder = Preorder::query()
            ->with(self::REGISTER_RELATIONS)
            ->whereKey($preorderId)
            ->whereNull('user_id')
            ->where('guest_session_id', $session?->id ?? -1)
            ->where('payment_status', PreorderPaymentStatus::Paid->value)
            ->firstOrFail();

        return new PreorderResource($preorder);
    }

    public function destroy(Preorder $preorder)
    {
        $this->authorize('delete', $preorder);
        $preorder->delete();

        return response()->noContent();
    }

    public function update(UpdatePreorderRequest $request, Preorder $preorder): PreorderResource
    {
        $this->authorize('update', $preorder);
        $preorder->update($request->validated());

        return new PreorderResource($preorder->fresh()->load(self::REGISTER_RELATIONS));
    }

    public function analytics(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()->isAdmin(), 403);
        $filters = $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return PreorderAnalyticsResource::collection($this->preorders->analytics($filters));
    }
}
