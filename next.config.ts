import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    viewTransition: true,
  },
  output: "standalone",
  outputFileTracingIncludes: {
    "*": ["drizzle/**", "node_modules/@codehz/workflow-bun-sqlite/**"],
  },
};

const workflowConfig = {};

export default withWorkflow(nextConfig, workflowConfig);
