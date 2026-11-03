"use client";

import { preorderApi } from "@/api/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useContext } from "react";
import useSWR from "swr";

export function OrdersView() {
    const { authStatus, ordersList, isOrdersLoading, ordersError } = useContext(GlobalContext);
    const { data: preorders, error: preordersError, isLoading: preordersLoading } = useSWR(
        authStatus === "loading" ? null : ["preorder-history", authStatus],
        () => authStatus === "authenficated" ? preorderApi.getPreorders() : preorderApi.getGuestPreorders(),
    );

    return (
        <main className="px-5 py-8 flex flex-col gap-10">
            <section>
                <h1 className="text-2xl">Orders</h1>
                {isOrdersLoading && <p>Loading orders…</p>}
                {ordersError && <p role="alert">Unable to load orders.</p>}
                {!isOrdersLoading && !ordersError && !ordersList?.length && <p>No paid orders yet.</p>}
                <ul className="flex flex-col gap-2">
                    {ordersList?.map(order => (
                        <li key={order.id} className="rounded border border-zinc-600 p-3">
                            <span>Order #{order.id}</span>{" · "}<span>{order.status}</span>{" · "}<span>{order.total} €</span>
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <h2 className="text-2xl">Pre-orders</h2>
                {preordersLoading && <p>Loading pre-orders…</p>}
                {preordersError && <p role="alert">Unable to load pre-orders.</p>}
                {!preordersLoading && !preordersError && !preorders?.data.length && <p>No paid pre-orders yet.</p>}
                <ul className="flex flex-col gap-2">
                    {preorders?.data.map(preorder => (
                        <li key={preorder.id} className="rounded border border-zinc-600 p-3">
                            <span>Pre-order #{preorder.id}</span>{" · "}<span>{preorder.payment_status}</span>{" · "}<span>{(preorder.payment_amount_cents / 100).toFixed(2)} {preorder.currency.toUpperCase()}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
