import {
    Hero,
    ScrollGallery,
    ThreeDGlassGallery,
    FurnitureGallery,
    Categories,
    ProfileSection,
} from "./_sections"

export const PageView = ()=> {
    return (
        <div>
            <Hero />
            <ScrollGallery />
            <ThreeDGlassGallery />
            <FurnitureGallery />
            <Categories />
            <ProfileSection />
            {/* <div className="h-[50vh]"/> */}
        </div>
    )
}