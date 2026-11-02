import { BookOpen, LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0C10] px-4">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#45A29E]/30 bg-[#1F2833]">
          <BookOpen size={27} className="text-[#66FCF1]" />
        </div>

        <div className="flex items-center gap-2.5">
          <LoaderCircle
            size={18}
            className="animate-spin text-[#66FCF1]"
          />
          <p className="text-sm font-medium tracking-wide text-[#C5C6C7]">
            Loading...
          </p>
        </div>

        <div className="h-1 w-32 overflow-hidden rounded-full bg-[#1F2833]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#45A29E]" />
        </div>
      </div>
    </div>
  );
}
