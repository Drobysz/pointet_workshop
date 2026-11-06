import { CheckBox } from "@/components/check_boxes/CheckBox/CheckBox";
import s from "./style.module.scss";
import { UnderlinedInnerLink } from "@/components/animations/UnderlinedLink/UnderlinedInnerLink";
import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";

export const Terms = ({
    areTermsCheked,
    setAreTermsChecked,
}: {
    areTermsCheked: boolean;
    setAreTermsChecked: Dispatch<SetStateAction<boolean>>;
})=> {
    const t = useTranslations("auth.register");

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
                {t.rich("terms", {
                    terms: (chunks)=> (
                        <UnderlinedInnerLink
                            colorLine="primary"
                            href="/docs"
                            className="text-red-300 font-semibold"
                        >
                            {chunks}
                        </UnderlinedInnerLink>
                    ),
                    privacy: (chunks)=> (
                        <UnderlinedInnerLink
                            colorLine="primary"
                            href="/docs"
                            className="text-red-300 font-semibold"
                        >
                            {chunks}
                        </UnderlinedInnerLink>
                    ),
                })}
            </p>
        </div>
    )
}