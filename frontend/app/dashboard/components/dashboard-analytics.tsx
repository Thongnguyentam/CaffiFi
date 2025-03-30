"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const predictionData = [
  { name: "Successful", value: 65, color: "#8B4513" },
  { name: "Pending", value: 25, color: "#d4b37f" },
  { name: "Failed", value: 10, color: "#A0522D" },
];

const performanceMetrics = [
  { metric: "Average Success Rate", value: "76.4%", color: "#d4b37f" },
  { metric: "Total Predictions", value: "1,234", color: "#8B4513" },
  { metric: "Active Users", value: "12,345", color: "#A0522D" },
  { metric: "Total Volume", value: "$1.2M", color: "#e8d5a9" },
];

export function DashboardAnalytics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)] transition-all">
        <CardHeader>
          <CardTitle className="text-[#d4b37f]">Prediction Status</CardTitle>
          <CardDescription className="text-[#e8d5a9]/70">
            Distribution of prediction outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={predictionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {predictionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)] transition-all">
        <CardHeader>
          <CardTitle className="text-[#d4b37f]">Performance Metrics</CardTitle>
          <CardDescription className="text-[#e8d5a9]/70">
            Key platform indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {performanceMetrics.map((metric) => (
              <div
                key={metric.metric}
                className="flex items-center justify-between p-4 rounded-lg bg-[#3a1e0a]/50 border border-[#8B4513]/20"
              >
                <span className="text-[#e8d5a9]/80">{metric.metric}</span>
                <span
                  style={{ color: metric.color }}
                  className="font-mono font-bold"
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
