import { CircularProgress } from "@mui/material"

export const CentralizedProgressLoading = ()=> {
    return (
        <div
            className="
                flex
                items-center
                justify-center
                h-screen
                text-red-700
            "
        >
            <CircularProgress
                size={30}
                color="inherit"
            />
        </div>
    )
}
