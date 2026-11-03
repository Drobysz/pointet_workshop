import { PhotonFeature, PhotonResponse } from "@/types/photon";
import { useEffect, useState } from "react";

export const usePhotonSuggestions = ({
    isActive,
    value
}: {
    isActive: boolean,
    value: string,   
})=> {
    const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);

    useEffect(()=> {
        if (!isActive || value.length < 3) return;
        
        const timeOutId = setTimeout(async () => {
            const params = new URLSearchParams({
                q: value,
                limit: "50",
                lang: "fr",
            });

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_PHOTON_URL}/?${params}`
            );

            if (!res.ok) return ;

            const data: PhotonResponse = await res.json();

            setSuggestions(data.features)
            
        }, 400);

        return ()=> {
            clearTimeout(timeOutId);
        }
    }, [value, isActive]);

    return {
        suggestions: suggestions
    }
}
