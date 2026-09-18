export class SrollService {
    static getOffset = (
        block: "start" | "center" | "end",
        targetHeight: number,
        innerHeight: number,
    )=> {
        switch (block) {
            case "start":
                
                return 0;
                break;
        
            case "center":
                
                return (targetHeight - innerHeight) / 2;
                break;
            
            case "end":
                
                return targetHeight - innerHeight;
                break;
        }
    }
}