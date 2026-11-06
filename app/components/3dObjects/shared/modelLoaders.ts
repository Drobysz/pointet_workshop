// Shared by the section preloader and React.lazy so model downloads can begin
// alongside the renderer, rather than waiting for the scene chunk to execute.
export const modelLoaders = {
    curated: () => import("../CuratedObjects3D/CuratedObjectsModel"),
    bag: () => import("../SilverBag3D/SilverBagModel"),
    dress: () => import("../SatinDress3D/SatinDressModel"),
};
