import { Skeleton } from "@mui/material";
import { Fragment } from "react/jsx-runtime";

export const Loading = ()=> {
    return (
        <>
            <section className="flex flex-col gap-5 self-stretch w-full px-3">
                {Array(5).fill(true).map((_, idx)=>
                    <Fragment key={`basket-item-loading-${idx}`}>
                        <div className="w-full overflow-hidden rounded-3xl">
                            <Skeleton
                                variant="rectangular"
                                height={100}
                            />
                        </div>

                        {idx < 4 && (
                            <div 
                                className="w-full h-px rounded-full bg-zinc-400"
                            />
                        )}
                    </Fragment>
                )}
            </section>

            <section 
                className="max-w-72.5 w-full h-full"
            >
                <div className="w-full max-w-75 overflow-hidden rounded-3xl">
                    <Skeleton
                        variant="rectangular"
                        height={200}
                    />
                </div>
            </section>
        </>
    )
}
