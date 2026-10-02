import { CheckBox } from "@/components/CheckBoxes/CheckBox/CheckBox";
import s from "./style.module.scss";
import { UnderlinedInnerLink } from "@/components/UnderlinedLink/UnderlinedInnerLink";
import { Dispatch, SetStateAction } from "react";

export const Terms = ({
    areTermsCheked,
    setAreTermsChecked,
}: {
    areTermsCheked: boolean;
    setAreTermsChecked: Dispatch<SetStateAction<boolean>>;
})=> {
    return (
        <div 
            className={s.terms_container}
        >
            <CheckBox
                type="sub-category"
                checked={areTermsCheked}
                setChecked={setAreTermsChecked}
            />

            <p className={s.terms_text}>
                I agree to the 
                <UnderlinedInnerLink
                    colorLine="primary"
                    href="/docs"
                    className="text-red-300 font-semibold"
                >
                    terms of use 
                </UnderlinedInnerLink>
                and 
                <UnderlinedInnerLink
                    colorLine="primary"
                    href="/docs"
                    className="text-red-300 font-semibold"
                >
                    privacy policy
                </UnderlinedInnerLink>
            </p>
        </div>
    )
}