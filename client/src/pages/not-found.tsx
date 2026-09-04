import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center bg-black px-4">
      <Card className="w-full max-w-md bg-black border-moodify-border rounded-none">
        <CardContent className="pt-8 pb-8">
          <div className="flex mb-4 gap-3 items-center">
            <AlertCircle className="h-6 w-6 text-lime" />
            <h1 className="font-mono text-sm tracking-widest text-white uppercase">404 // Signal Lost</h1>
          </div>
          <p className="font-mono text-xs text-moodify-muted tracking-wider mb-6">
            This route is outside the editorial spectrum.
          </p>
          <Link
            href="/"
            className="inline-block font-mono text-xs text-lime border border-lime px-5 py-3 tracking-widest hover:bg-lime hover:text-black transition-colors"
          >
            RETURN HOME
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
