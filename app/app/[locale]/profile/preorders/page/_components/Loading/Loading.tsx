"use client";

import { Skeleton } from "@mui/material"

export const Loading = ()=> {
    return (
        <>
            {Array(5).fill(true).map((_, idx)=>
                <li
                    key={`order-load-${idx}`}
                    className="overflow-hidden rounded-2xl"
                >
                    <Skeleton
                        animation="wave"
                        variant="rounded"
                        width="100%"
                        height={100}
                    />
                </li>
            )}
        </>
    )
}
