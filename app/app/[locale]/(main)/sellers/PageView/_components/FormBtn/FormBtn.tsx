import { LinkBtn } from "@/components"
import { CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";

export const FormBtn = ({
    pending
}: {
    pending: boolean;
})=> {
    const t = useTranslations("seller.form");

    return (
         <div className="col-span-2 flex justify-center">
            <LinkBtn
                withArrow
                icon="link"
                size="lg"
                type="submit"
                className="rounded-xl"
            >
                {pending 
                    ? <CircularProgress
                        color="inherit"
                        size={30}  
                    />
                    : t("submit")}
            </LinkBtn>
        </div>
    )
}
