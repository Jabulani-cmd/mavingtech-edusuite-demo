import { useDemoData } from "@/contexts/DemoDataContext";
import { RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const SettingsPage = () => {
  const { resetData } = useDemoData();

  const handleReset = () => {
    resetData();
    toast.success("Demo data has been reset to defaults");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Demo configuration and data management</p>
      </div>

      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              Reset Demo Data
            </CardTitle>
            <CardDescription>Restore all students, teachers, classes, attendance, and grades to their original demo values.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset All Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Info className="h-4 w-4 text-info" />
              About This Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>This is a demonstration version of the <strong className="text-foreground">MavingTech School Management System</strong>.</p>
            <p>All data is fictitious and stored in-memory. Changes will be lost on page refresh.</p>
            <p>School: <strong className="text-foreground">MavingTech Demonstration Academy</strong></p>
            <p className="pt-2"><span className="demo-badge">Demo Version</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
