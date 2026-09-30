"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Layout, Module } from "@/lib/schema";
import Balance from "./modules/Balance";
import Goals from "./modules/Goals";
import StepPlan from "./modules/StepPlan";
import Family from "./modules/Family";
import Housing from "./modules/Housing";
import Crisis from "./modules/Crisis";
import Advisor from "./modules/Advisor";
import InfoCard from "./modules/InfoCard";

function renderModule(m: Module) {
  switch (m.type) {
    case "Balance":
      return <Balance {...m} />;
    case "Goals":
      return <Goals {...m} />;
    case "StepPlan":
      return <StepPlan {...m} />;
    case "Family":
      return <Family {...m} />;
    case "Housing":
      return <Housing {...m} />;
    case "Crisis":
      return <Crisis {...m} />;
    case "Advisor":
      return <Advisor {...m} />;
    case "InfoCard":
      return <InfoCard {...m} />;
  }
}

export default function Renderer({ layout }: { layout: Layout }) {
  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="popLayout">
        {layout.map((m, i) => (
          <motion.div
            key={`${m.type}-${i}`}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {renderModule(m)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
