import DitheredFooter from "@/components/ui/dithered-footer";

export default function DitheredFooterDemo() {
    return (
        // Footer pinned to the bottom of the frame, so the whole dot band is in view.
        <div className="flex min-h-screen flex-col justify-end bg-background">
            {/* Swap this for your real signup call. Resolving shows the thank-you message. */}
            <DitheredFooter onSubscribe={() => new Promise((resolve) => setTimeout(resolve, 600))} />
        </div>
    );
}
