import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    viewTransition: true,
  },
  output: "standalone",
  outputFileTracingIncludes: {
    "*": ["drizzle/**", "node_modules/@workflow/world-local/**"],
  },
};

const workflowConfig = {};

export default withWorkflow(nextConfig, workflowConfig);
