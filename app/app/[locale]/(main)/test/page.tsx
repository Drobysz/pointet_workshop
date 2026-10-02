import { AuthModalWindow } from "@/components";


export default function TestPage () {
    return (
        <div
            className="p-10 flex flex-col gap-10"
        >
            <div className="flex justify-center">
                <AuthModalWindow
                    className=""
                >
                    <div 
                        className="h-80"
                    />
                </AuthModalWindow>
            </div>
        </div>
    )
}
