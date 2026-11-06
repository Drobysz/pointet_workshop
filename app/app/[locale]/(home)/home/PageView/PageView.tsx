import {
    Hero,
    ScrollGallery,
    ThreeDGlassGallery,
    OutfitGallery,
    Categories,
} from "./_sections"

export const PageView = ()=> {
    return (
        <div>
            <Hero />
            <ScrollGallery />
            <ThreeDGlassGallery />
            <OutfitGallery />
            <Categories />
            {/* <div className="h-[50vh]"/> */}
        </div>
    )
}