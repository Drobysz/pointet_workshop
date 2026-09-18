import {
    MouseGuide,
    NotificationBar,
    PopUpWindow,
    LangBar,
} from "./_components";

const LayoutOverlays = ()=> {
    return (
        <>
            <PopUpWindow />
            <MouseGuide />
            <NotificationBar />
            <LangBar />
        </>
    )
}

export default LayoutOverlays;
