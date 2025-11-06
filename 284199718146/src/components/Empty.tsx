import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * 空状态组件，用于占位显示
 */
export function Empty(): JSX.Element {
  return (
    <div 
      className={cn("flex h-full items-center justify-center")} 
      onClick={() => toast('Coming soon')}
    >
      Empty
    </div>
  );
}