import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Save, Loader2 } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useToast } from "@/hooks/use-toast";

export default function ExchangeRateCard() {
  const { rate, loading, updateRate } = useExchangeRate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [newRate, setNewRate] = useState("");
  const [saving, setSaving] = useState(false);

  // Live converter state
  const [usdVal, setUsdVal] = useState("");
  const [zigVal, setZigVal] = useState("");

  const handleUsdChange = (v: string) => {
    setUsdVal(v);
    const n = parseFloat(v);
    setZigVal(isNaN(n) ? "" : (n * rate).toFixed(2));
  };

  const handleZigChange = (v: string) => {
    setZigVal(v);
    const n = parseFloat(v);
    setUsdVal(isNaN(n) || rate === 0 ? "" : (n / rate).toFixed(2));
  };

  const handleSave = async () => {
    const parsed = parseFloat(newRate);
    if (isNaN(parsed) || parsed <= 0) {
      toast({ title: "Invalid rate", description: "Enter a positive number.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await updateRate(parsed);
    toast({ title: "Exchange Rate Updated", description: `1 USD = ${parsed} ZiG` });
    setEditing(false);
    setSaving(false);
    // Reset converter
    setUsdVal("");
    setZigVal("");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
          Exchange Rate (USD / ZiG)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current rate */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Current Rate</p>
            <p className="text-lg font-bold">1 USD = {rate.toLocaleString()} ZiG</p>
          </div>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => { setEditing(true); setNewRate(String(rate)); }}>
              Update
            </Button>
          )}
        </div>

        {/* Edit rate */}
        {editing && (
          <div className="space-y-2 rounded-lg border p-3">
            <Label className="text-xs">New Exchange Rate (1 USD = ? ZiG)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="e.g. 27.50"
              />
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Quick converter */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick Converter</p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">USD</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={usdVal}
                onChange={(e) => handleUsdChange(e.target.value)}
              />
            </div>
            <ArrowRightLeft className="mb-2 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label className="text-xs">ZiG</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={zigVal}
                onChange={(e) => handleZigChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
