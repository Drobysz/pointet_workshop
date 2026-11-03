"use client";

import { Photon } from "@/helpers";
import { PhotonFeature } from "@/types/photon"
import { Fragment } from "react/jsx-runtime";
import s from "./style.module.scss";

export const SuggestionList = ({
    suggestions,
    handleSuggestionClick,
}: {
    suggestions: PhotonFeature[];
    handleSuggestionClick: (address: string)=> void;
})=> {
    return (
        <div className={s.suggestion_container}
        >
            <ul className={s.suggestion_list}>
                {suggestions.map((sgt, idx)=> {
                    const address = Photon.toAddressString(sgt);
                    const shortAddress = address.length > 30
                        ? address.slice(0, 100) + "..."
                        : address;

                    return (
                        <Fragment
                            key={`suggestion-${idx}`}
                        >
                            <li 
                                className={s.suggestion_list__element}
                                onClick={()=> handleSuggestionClick(address)}
                            >
                                {shortAddress}
                            </li>

                            {idx < (suggestions.length - 1) &&
                                <div 
                                    className={s.suggestion_list__divider}
                                />
                            }
                        </Fragment>
                    )
                })}
            </ul>
        </div>
    )
}