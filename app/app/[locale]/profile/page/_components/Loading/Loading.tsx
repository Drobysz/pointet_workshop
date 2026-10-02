"use client";

import { Skeleton } from "@mui/material";

export const Loading = ()=> {
    return (
        <div className="flex gap-10 px-3">
            <div className="flex items-center gap-2">
                <Skeleton 
                    variant="circular"
                    animation="wave"
                    width={60}
                    height={60}
                />

                <Skeleton 
                    variant="rounded"
                    animation="wave"
                    width={150}
                    height={40}
                />
            </div>
            {Array(3).fill(true).map((_, i)=>
                <div
                    key={`load_id_profile_${i}`} 
                    className="flex flex-col gap-3"
                >
                    <Skeleton 
                        variant="rounded"
                        animation="wave"
                        width={60}
                        height={20}
                    />

                    <Skeleton 
                        variant="rounded"
                        animation="wave"
                        width={270}
                        height={35}
                    />
                </div>
            )}

        </div>
    )
}