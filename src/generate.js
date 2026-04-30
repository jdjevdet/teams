import { generateEpg } from "./generator.js";

try {
  const result = await generateEpg();
  console.log(`Generated ${result.outputPath} for ${result.dateKey}: ${result.teamCount} teams, ${result.eventCount} events.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
