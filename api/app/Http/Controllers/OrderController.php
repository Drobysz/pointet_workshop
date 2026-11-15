<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Http\Requests\OrderRequest;
use App\Http\Requests\OrderTrackingLinkRequest;
use App\Http\Resources\OrderCheckoutSessionResource;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderTrackingLinkResource;
use App\Models\Order;
use App\Models\OrderTrackingLink;
use App\Services\Checkout\GuestSessionService;
use App\Services\Checkout\OrderCheckoutService;
use App\Services\TransactionalEmails;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private const ITEM_RELATIONS = ['items.good.images', 'items.inventory'];

    public function __construct(private readonly OrderCheckoutService $checkouts) {}

    public function guestIndex(Request $request, GuestSessionService $guests): AnonymousResourceCollection
    {
        $data = $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $session = $guests->resolve($request);
        $query = Order::query()->with(self::ITEM_RELATIONS)->whereNull('user_id')->where('status', '!=', OrderStatus::Cancelled->value);
        if (! $session) {
            $query->whereRaw('1 = 0');
        } else {
            $query->where('guest_session_id', $session->id);
        }

        return OrderResource::collection(
            $query->latest('placed_at')->paginate($data['per_page'] ?? 20)->withQueryString(),
        );
    }

    public function guestShow(int $orderId, Request $request, GuestSessionService $guests): OrderDetailResource
    {
        $session = $guests->resolve($request);
        $order = Order::query()
            ->with(['user', 'trackingLinks', ...self::ITEM_RELATIONS])
            ->whereKey($orderId)
            ->whereNull('user_id')
            ->where('guest_session_id', $session?->id ?? -1)
            ->where('status', '!=', OrderStatus::Cancelled->value)
            ->firstOrFail();

        return new OrderDetailResource($order);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'user_id' => ['nullable', 'integer'],
        ]);
        $query = Order::query()->with(self::ITEM_RELATIONS);

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        } elseif ($data['user_id'] ?? null) {
            $query->where('user_id', $data['user_id']);
        }

        $search = $data['search'] ?? null;
        if ($search) {
            $phrase = '%'.mb_strtolower($search).'%';
            $orderId = ctype_digit($search) ? (int) $search : -1;

            $query->where(function (Builder $orders) use ($phrase, $orderId): void {
                $orders
                    ->whereRaw('LOWER(customer_name) LIKE ?', [$phrase])
                    ->orWhereRaw('LOWER(customer_email) LIKE ?', [$phrase])
                    ->orWhere('id', $orderId);
            });
        }

        return OrderResource::collection(
            $query->latest('placed_at')->get(),
        );
    }

    public function show(Order $order): OrderDetailResource
    {
        $this->authorize('view', $order);

        return new OrderDetailResource($order->load(['user' => fn ($query) => $query->withResourceCounts(), 'trackingLinks', ...self::ITEM_RELATIONS]));
    }

    public function store(OrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $guest = $user ? null : app(GuestSessionService::class)->resolveOrCreate($request);
        $checkout = $this->checkouts->startCheckoutFromBasket(
            $user,
            $guest['session'] ?? null,
            $request->validated('idempotency_key'),
            $request->validated('items', []),
            $request->validated('email'),
            $request->validated('full_name'),
            $request->validated('address'),
        );
        $response = (new OrderCheckoutSessionResource($checkout))->response($request);
        if (isset($guest['cookie']) && $guest['cookie']) {
            $response->withCookie($guest['cookie']);
        }

        return $response;
    }

    public function update(OrderRequest $request, Order $order, TransactionalEmails $emails): OrderDetailResource
    {
        $this->authorize('update', $order);
        $status = OrderStatus::from($request->validated('status'));
        DB::transaction(function () use ($order, $status, $emails): void {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $changed = $locked->status !== $status;
            $locked->update(['status' => $status]);
            $locked->items()->update(['status' => $status]);
            // Only a real change notifies the customer; re-saving the same status stays silent.
            if ($changed) {
                $emails->orderStatusChanged($locked, $status);
            }
        });
        $order->refresh();

        return new OrderDetailResource($order->load(['user' => fn ($query) => $query->withResourceCounts(), 'trackingLinks', ...self::ITEM_RELATIONS]));
    }

    public function storeTrackingLink(OrderTrackingLinkRequest $request, Order $order, TransactionalEmails $emails): JsonResponse
    {
        $this->authorize('update', $order);
        $link = DB::transaction(function () use ($request, $order, $emails): OrderTrackingLink {
            // Serialise concurrent additions so only the very first link can advance the status.
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $isFirstLink = ! $locked->trackingLinks()->exists();

            $link = $locked->trackingLinks()->create([
                'user_id' => $request->user()->id,
                'tracking_url' => $request->validated('tracking_url'),
            ]);
            // The first link means the parcel left. Later links never touch the status, and
            // orders that are already delivered, cancelled or reported keep theirs.
            if ($isFirstLink && $locked->status === OrderStatus::Processing) {
                $locked->update(['status' => OrderStatus::Sent]);
                $locked->items()->update(['status' => OrderStatus::Sent]);
            }
            // The tracking email already announces the shipment, so no separate status email is sent here.
            // Committed together with the link; the queue worker performs delivery.
            $emails->orderTracking($locked, $link);

            return $link;
        });

        return (new OrderTrackingLinkResource($link))->response($request)->setStatusCode(201);
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);
        $order->delete();

        return response()->noContent();
    }
}
