import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900"> {/* Added dark background */}
      <Card className="w-full max-w-md mx-4 dark:bg-gray-800"> {/* Added dark card background */}
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-yellow-500 dark:text-yellow-400" /> {/* Adjusted icon color for dark mode */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Uh Oh! Lost in the Digital Wilderness?</h1> {/* Added dark text color */}
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300"> {/* Added dark text color */}
            It seems the page you were looking for decided to go on a coffee break. We've sent out a search party (mostly interns), but they haven't found it yet.
          </p>
           <p className="mt-2 text-sm text-gray-600 dark:text-gray-300"> {/* Added dark text color */}
            Perhaps you mistyped the address, or maybe this page never existed in the first place? Spooky!
          </p>
           <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400"> {/* Added dark text color */}
            (Don't worry, our developers are probably just blaming the cache.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
