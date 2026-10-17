import { User } from "@/api/types/user"
import { EmailForm, FormSectionTitle, InputForm } from "../../_components"
import { userApi } from "@/api/api"

export const PersonalInfoSection = ({
    user
}: {
    user: User
})=> {
    return (
        <div className="flex flex-col gap-4 max-w-200 w-full">
            <FormSectionTitle>
                Personal information
            </FormSectionTitle>

            <EmailForm
                userId={user.id}
                initialValue={user.email}
            />

            <InputForm
                userId={user.id}
                label="phone number"
                initialValue={user.tel ?? ""}
                param="tel"
                request={(userId, data) => {
                    return userApi.updateUser(userId, data);
                }}
            />

            <InputForm
                userId={user.id}
                label="address"
                initialValue={user.address ?? ""}
                param="address"
                placeholder="Street, City, Postal code, Country"
                request={(userId, data) => {
                    return userApi.updateUser(userId, data);
                }}
            />
        </div>
    )
}
