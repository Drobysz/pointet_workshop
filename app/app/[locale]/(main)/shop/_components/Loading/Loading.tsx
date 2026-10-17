"use client";

import { Skeleton } from "@mui/material";

export const Loading = ()=> {
    return (
        <div className="flex flex-wrap justify-around gap-y-4">
            {Array(12).fill(true).map((_, idx)=>
                <article
                    key={`good-category-${idx}`}
                    className="rounded-2xl overflow-hidden"
                >
                    <Skeleton
                        key={`good-category-${idx}`}
                        variant="rounded"
                        animation="wave"
                        width={270}
                        height={350}
                    />
                </article>
            )}
        </div>
    )
}
