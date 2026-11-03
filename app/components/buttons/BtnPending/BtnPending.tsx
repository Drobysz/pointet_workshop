import { CircularProgress } from "@mui/material";
import { ReactNode } from "react"

export const BtnPending = ({
    pending,
    children,
}: {
    pending: boolean;
    children: ReactNode;
})=> {
    return (
        <>
            {pending 
                ? <CircularProgress
                    size={10}
                    color="inherit"
                    className="z-30"
                />
                : children
            }
        </>
    )
}