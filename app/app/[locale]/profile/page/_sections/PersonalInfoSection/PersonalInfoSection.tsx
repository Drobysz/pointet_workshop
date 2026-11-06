import { User } from "@/api/types/user"
import { EmailForm, FormSectionTitle, InputForm } from "../../_components"
import { userApi } from "@/api/api"
import { useTranslations } from "next-intl";

export const PersonalInfoSection = ({
    user
}: {
    user: User
})=> {
    const t = useTranslations("profile.personalInfo");

    return (
        <div className="flex flex-col gap-4 max-w-200 w-full">
            <FormSectionTitle>
                {t("title")}
            </FormSectionTitle>

            <EmailForm
                userId={user.id}
                initialValue={user.email}
            />

            <InputForm
                userId={user.id}
                label={t("tel.label")}
                successMessage={t("tel.updated")}
                initialValue={user.tel ?? ""}
                param="tel"
                request={(userId, data) => {
                    return userApi.updateUser(userId, data);
                }}
            />

            <InputForm
                userId={user.id}
                label={t("address.label")}
                successMessage={t("address.updated")}
                initialValue={user.address ?? ""}
                param="address"
                placeholder={t("address.placeholder")}
                request={(userId, data) => {
                    return userApi.updateUser(userId, data);
                }}
            />
        </div>
    )
}
