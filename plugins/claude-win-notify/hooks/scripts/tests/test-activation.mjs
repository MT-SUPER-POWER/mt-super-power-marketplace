#!/usr/bin/env node
import { toXmlString } from "powertoast";

const xml = toXmlString({
  title: "Claude Code waiting for approval",
  message: "Run: git status",
  activation: {
    type: "protocol",
    launch: "claude-win-notify://focus",
  },
});

const passed = xml.includes('activationType="protocol"') &&
  xml.includes('launch="claude-win-notify://focus"');
console.log(passed ? "Focus protocol activation: PASS" : "Focus protocol activation: FAIL");
process.exit(passed ? 0 : 1);
