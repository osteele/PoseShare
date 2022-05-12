import * as fs from "fs";
import { createHash } from "crypto";

/** Compute the hash of a directory and its contents.
 * Ignores files that start with a dot.
 *
 * @param dir The directory to hash.
 * @returns The hash of the directory and its contents.
 * @example
 * ```
 * const hash = computeDirectoryHash("./public");
 * ```
 */
export function computeDirectoryHash(dir: string): string {
  const h = createHash("sha256");
  visit(dir);
  return h.digest("hex");

  function visit(path: string) {
    if (fs.statSync(path).isDirectory()) {
      fs.readdirSync(path)
        .filter((file) => !file.startsWith("."))
        .forEach((file) => {
          visit(`${path}/${file}`);
        });
    } else {
      // update the hash with the contents of the file
      h.update(fs.readFileSync(path));
    }
  }
}
