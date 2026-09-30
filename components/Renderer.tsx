"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Layout, Module, Tone } from "@/lib/schema";
import { ToneProvider, toneStyles } from "@/lib/tone";
import Balance from "./modules/Balance";
import Goals from "./modules/Goals";
import StepPlan from "./modules/StepPlan";
import Family from "./modules/Family";
import Housing from "./modules/Housing";
import Crisis from "./modules/Crisis";
import Advisor from "./modules/Advisor";
import InfoCard from "./modules/InfoCard";
import TravelPlanner from "./modules/TravelPlanner";
import Budget from "./modules/Budget";
import InsuranceCheck from "./modules/InsuranceCheck";
import Timeline from "./modules/Timeline";

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
    case "TravelPlanner":
      return <TravelPlanner {...m} />;
    case "Budget":
      return <Budget {...m} />;
    case "InsuranceCheck":
      return <InsuranceCheck {...m} />;
    case "Timeline":
      return <Timeline {...m} />;
  }
}

/**
 * Key by module type + occurrence, not by customer: a Balance card that exists in both
 * layouts stays mounted and glides to its new position, new modules slide in, removed ones fade out.
 */
function moduleKeys(layout: Layout): string[] {
  const seen: Record<string, number> = {};
  return layout.map((m) => {
    const n = (seen[m.type] = (seen[m.type] ?? 0) + 1);
    return `${m.type}-${n}`;
  });
}

const spring = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;

export default function Renderer({ layout, tone }: { layout: Layout; tone: Tone }) {
  const keys = moduleKeys(layout);
  return (
    <ToneProvider tone={tone}>
      <motion.div layout className={`flex flex-col ${toneStyles[tone].stack}`} transition={spring}>
        <AnimatePresence mode="popLayout" initial={false}>
          {layout.map((m, i) => (
            <motion.div
              key={keys[i]}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: { ...spring, delay: 0.08 + i * 0.07 } }}
              exit={{ opacity: 0, x: -60, scale: 0.94, transition: { duration: 0.22 } }}
              transition={spring}
            >
              {renderModule(m)}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </ToneProvider>
  );
}
