import { Toast } from "powertoast";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const icon = join(__dirname, "..", "..", "..", "assets", "claude.svg");
const hasWT = spawnSync("where", ["wt.exe"], { windowsHide: true, timeout: 3000 }).status === 0;
const aumid = hasWT ? "Microsoft.WindowsTerminal_8wekyb3d8bbwe!App" : undefined;

const toast = new Toast({
  title: "Claude Code 通知",
  message: "通知功能测试正常",
  icon: existsSync(icon) ? icon : "",
  aumid,
});

toast.show()
  .then(() => console.log("OK"))
  .catch(e => console.log("FAIL:", e.message));
