import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function TestAccountsManager() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(10);
  const [createdAccounts, setCreatedAccounts] = useState<any[]>([]);

  const handleCreateTestAccounts = async () => {
    if (count < 1 || count > 50) {
      toast.error("Ο αριθμός πρέπει να είναι μεταξύ 1 και 50");
      return;
    }

    setLoading(true);
    setCreatedAccounts([]);

    try {
      const { data, error } = await supabase.functions.invoke('create-test-accounts', {
        body: { count }
      });

      if (error) throw error;

      setCreatedAccounts(data.accounts || []);
      toast.success(data.message || `Δημιουργήθηκαν ${data.count} test accounts!`);
    } catch (error: any) {
      console.error('Error creating test accounts:', error);
      toast.error(error.message || "Σφάλμα κατά τη δημιουργία test accounts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Test Accounts Generator</h2>
            <p className="text-sm text-muted-foreground">
              Δημιούργησε τυχαία προφίλ μαμάδων για testing
            </p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            Τα test accounts θα έχουν:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email: [username]@test.momconnect.com</li>
              <li>Password: TestMom2024!</li>
              <li>Τυχαία ελληνικά ονόματα, πόλεις, περιοχές</li>
              <li>Τυχαία ενδιαφέροντα (5-12)</li>
              <li>Τυχαία παιδιά (1-2)</li>
              <li>Placeholder φωτογραφίες (2-5)</li>
              <li>Ολοκληρωμένο profile & onboarding</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="count">Αριθμός Accounts (1-50)</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleCreateTestAccounts}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Δημιουργία...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Δημιούργησε {count} Test Accounts
              </>
            )}
          </Button>
        </div>

        {createdAccounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Δημιουργήθηκαν {createdAccounts.length} Accounts:</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {createdAccounts.map((account, index) => (
                <Card key={index} className="p-3 bg-secondary/20">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-muted-foreground">
                        {account.city}, {account.area}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {account.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Password: {account.password}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                💡 Tip: Κάνε copy το email και password για να κάνεις login με αυτά τα accounts
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  );
}
