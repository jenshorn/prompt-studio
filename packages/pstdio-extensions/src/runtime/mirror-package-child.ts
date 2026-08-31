import { copyFileSync, lstatSync, statSync, symlinkSync } from "node:fs";

/**
 * Mirror a single package child (file or directory) from a source tree into the
 * runtime cache.
 *
 * Real directories become junctions. Everything else is symlinked so the cache
 * doesn't duplicate content or lose permission bits like the executable flag —
 * except on Windows, which can't create file symlinks without elevated
 * privileges, so there we copy plain files and follow symlinks to whatever they
 * resolve to.
 *
 * Shared by the loader's `node_modules` mirror and the runtime source snapshot
 * so the Windows carve-out only ever lives in one place.
 */
export const mirrorPackageChild = (sourcePath: string, targetPath: string) => {
  const linkStats = lstatSync(sourcePath);

  if (linkStats.isDirectory()) {
    symlinkSync(sourcePath, targetPath, "junction");
    return;
  }

  if (process.platform !== "win32") {
    // Matches the pre-Windows behavior: plain files and symlinks (even dangling
    // ones) are symlinked without dereferencing the target.
    symlinkSync(sourcePath, targetPath, "file");
    return;
  }

  const resolved = linkStats.isSymbolicLink() ? statSync(sourcePath) : linkStats;
  if (resolved.isDirectory()) symlinkSync(sourcePath, targetPath, "junction");
  else copyFileSync(sourcePath, targetPath);
};
