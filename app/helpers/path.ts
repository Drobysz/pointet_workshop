import { TabListType } from "@/components/navigation/NavBar/types";

export class PathService {
    static getPageActivity(path: string, href?: string, list?: TabListType[]) {
        const pathPoints = (path.split("?")[0]).split('/');
        const tabList = list && list.length > 0 ? list?.map(tab=> tab.href) : [href];

        for (const tabHref of tabList) {
            const tabHrefPoints = tabHref?.split('/') ?? [];
            const tabPagename = tabHrefPoints[tabHrefPoints.length - 1];

            const isActive = pathPoints[pathPoints.length - 1].includes(tabPagename);

            if (tabPagename == '') {
                if (path === '' || path === '/') {
                    return true;
                }
            } else if (isActive) {
                return true;
            };
        }

        return false;
    }

    static withBasePath(path: string) {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

        if (!basePath || basePath === "/") {
            return path;
        }

        return `${basePath.replace(/\/$/, "")}${path}`;
    }

    static paramsToString<T extends object>(
        params: T
    ) {
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null) {
                continue;
            }

            searchParams.set(key, String(value));
        }

        return searchParams.toString();
    }
}
