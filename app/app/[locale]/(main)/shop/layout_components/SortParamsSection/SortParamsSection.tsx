import s from "./style.module.scss";
import {
    CategoryList,
    Searchbar
} from "./_components"
import { MobileFilters } from "../MobileFilters/MobileFilters";

export const SortParamsSection = ()=> {
    return (
        <header 
            className={s.sort_params_container}
        >
            <Searchbar />
            <MobileFilters />
            <CategoryList />
        </header>
    )
}
