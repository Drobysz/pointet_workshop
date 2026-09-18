import { ReactNode } from "react";
import { 
    LoginForm,
    RegisterForm,    
} from "./windows/index";

export type PopUpWindowsProps = Record<string, ReactNode>;

export const PopUpWindows: PopUpWindowsProps = {
    "RegisterForm": <RegisterForm />,
    "LoginForm": <LoginForm />,
    "none": <></>
};
