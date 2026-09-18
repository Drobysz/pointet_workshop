// Shared by the section preloader and React.lazy so model downloads can begin
// alongside the renderer, rather than waiting for the scene chunk to execute.
export const modelLoaders = {
    wine: () => import("../WineGlass3D/WineGlassModel"),
    plate: () => import("../SilverPlate3D/SilverPlateModel"),
    fork: () => import("../SilverFork3D/SilverForkModel"),
};
