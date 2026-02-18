import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RecipeAnalysis() {
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const costHistory = trpc.recipes.getCostHistory.useQuery({ recipeId: selectedRecipe || 0 }, { enabled: !!selectedRecipe });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recipe Costing Analysis</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Latest Cost</p>
          <p className="text-3xl font-bold">${costHistory.data?.[0]?.totalCost || "0.00"}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600">Ingredients</p>
          <p className="text-3xl font-bold">{costHistory.data?.[0]?.ingredientCount || 0}</p>
        </Card>
      </div>
      {costHistory.data && costHistory.data.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">Cost Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costHistory.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="recordedAt" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalCost" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
