"use client";

import { 
    ChangeEvent, 
    MouseEvent, 
    useContext, 
    useRef, 
    useState 
} from "react";
import { SquarePen, UserRound } from "lucide-react";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { after, tinyFive } from "@/fonts/fonts";
import { userApi } from "@/api/api";
import { Id } from "@/api/types/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";

export const FullnameSection = ({
    full_name,
    userId
}: {
    full_name: string;
    userId: Id;
})=> {
    const { setNotification, mutateUser } = useContext(GlobalContext);
    const inputRef = useRef< HTMLInputElement | null>(null);
    const [value, setValue] = useState(full_name);
    const [isInputActive, setIsInputActive] = useState(false);

    const isButtonDisabled = value.trim() === full_name;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>)=> {
        setValue(e.target.value);
    };

    const handleInputMouseDown = (e: MouseEvent<HTMLInputElement>)=> {
        e.preventDefault();
        e.stopPropagation();
    }
    const handleInputBlur = ()=> setIsInputActive(false);

    const handleEditBtnClick = ()=> {
        setIsInputActive(true);
        inputRef.current?.focus();
    };

    const updateUserFullname = async ()=> {
        try {
            await userApi.updateUser(userId, {
                full_name: value.trim()
            });

            mutateUser();

            setNotification({
                status: "success",
                text: "User fullname was updated"
            });
        } catch (error) {
            setNotification({
                status: "error",
                text: getApiErrorMessage(error)
            });
        }
    };

    return (
        <section
            className={s.section_container}
        >
            {/* User Icon */}
            <div 
                className={s.user_icon_wrapper}
            >
                <UserRound 
                    className={s.user_icon}
                />
                <div 
                    className={s.user_background}
                />
            </div>

            <form 
                className={s.form_section}
                action={updateUserFullname}
            >
                <div className="flex items-center gap-1">
                    <input
                        className={cn(
                            after.className,
                            s.fullname_form,
                            isInputActive && "text-red-900"
                        )}
                        ref={inputRef}
                        type="text"
                        value={value}

                        onChange={handleInputChange}
                        onMouseDown={handleInputMouseDown}
                        onBlur={handleInputBlur}
                    />

                    <span
                        onClick={handleEditBtnClick}
                        className={s.edit_btn_frame}
                    >
                        <SquarePen 
                            className={s.edit_btn}
                        />
                    </span>
                </div>
                {!isButtonDisabled &&
                    <button
                        className={cn(
                            s.fullname_submit_btn,
                            tinyFive.className
                        )}
                        type="submit"
                        disabled={isButtonDisabled}
                    >
                        Save
                    </button>
                }
            </form>
        </section>
    )
}
