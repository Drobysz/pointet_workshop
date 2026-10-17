import { categoryApi } from "@/api/api";
import { Suspense } from "react";
import { PageView } from "./page/PageView";
import { CentralizedProgressLoading } from "@/components";
import { GoodContextProvider } from "./context/good.context";

export async function generateStaticParams() {
    const goods = await categoryApi.getAllGoods();

    return goods.map((good) => ({
        good_id: String(good.id)
    }));
}

export default async function GoodPage({
    params
}: {
    params: Promise<{
        good_id: string
    }>
}) {
    const { good_id } = await params;

    const good = await categoryApi.getGood(Number(good_id));

    return (
        <GoodContextProvider
            good={good.data}
        >
            <Suspense 
                fallback={
                    <CentralizedProgressLoading />
                }
            >
                <PageView 
                    good={good.data}
                />
            </Suspense>
        </GoodContextProvider>
    )
}
