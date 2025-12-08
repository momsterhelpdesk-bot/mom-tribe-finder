import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const screenshots = [
  { name: "Welcome Screen", file: "store-screenshot-1-welcome.png" },
  { name: "Discover Moms", file: "store-screenshot-2-discover.png" },
  { name: "Chat", file: "store-screenshot-3-chat.png" },
  { name: "Ask Moms", file: "store-screenshot-4-askmoms.png" },
  { name: "This or That", file: "store-screenshot-5-thisorthat.png" },
];

const Screenshots = () => {
  const handleDownload = (file: string, name: string) => {
    const link = document.createElement("a");
    link.href = `/screenshots/${file}`;
    link.download = file;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-momster-pink to-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-momster-dark text-center mb-2">
          Momster Screenshots 📱
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Πάτησε παρατεταμένα σε κάθε εικόνα για να την αποθηκεύσεις
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.file}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <img
                src={`/screenshots/${screenshot.file}`}
                alt={screenshot.name}
                className="w-full h-auto"
              />
              <div className="p-3">
                <p className="font-medium text-sm text-momster-dark mb-2">
                  {screenshot.name}
                </p>
                <Button
                  onClick={() => handleDownload(screenshot.file, screenshot.name)}
                  size="sm"
                  className="w-full bg-momster-accent hover:bg-momster-accent/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          💡 Tip: Από κινητό, πάτα παρατεταμένα στην εικόνα → "Αποθήκευση εικόνας"
        </p>
      </div>
    </div>
  );
};

export default Screenshots;
