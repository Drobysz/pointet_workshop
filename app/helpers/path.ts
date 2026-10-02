import { TabListType } from "@/components/NavBar/types";

export class PathService {
    static getPageActivity(path: string, href?: string, list?: TabListType[]) {
        const pathPoints = path.split('/');
        const tabList = list ? list?.map(tab=> tab.href) : [href];

        for (const tabHref of tabList) {
            const tabHrefPoints = tabHref?.split('/') ?? [];
            const tabPagename = tabHrefPoints[tabHrefPoints.length - 1];

            if (tabPagename == '') {
                if (path === '' || path === '/') {
                    return true;
                }
            } else if (pathPoints.filter(p => p !== '').includes(tabPagename)) {
                return true
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
}
