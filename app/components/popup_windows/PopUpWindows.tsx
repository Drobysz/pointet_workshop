import { ReactNode } from "react";
import { 
    LoginForm,
    RegisterForm,
    DeleteAccountWindow,
    VerifyEmailCodeWindow,
} from "./windows/index";
import { PopUpWindow } from "@/app/[locale]/context/global.interface";

export type PopUpWindowsProps = Record<PopUpWindow, ReactNode>;

export const PopUpWindows: PopUpWindowsProps = {
    "RegisterForm": <RegisterForm />,
    "LoginForm": <LoginForm />,
    "DeleteWindow": <DeleteAccountWindow />,
    "VerifyCodeWindow": <VerifyEmailCodeWindow />,
    "none": <></>
};
