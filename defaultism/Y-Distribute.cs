using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Defaultism
{
    public static class ShellProvider
    {
        public static bool Set(string drive, string name, string value)
        {
            string providerName = drive.Trim();
            if (!providerName.EndsWith(":", StringComparison.Ordinal))
                providerName += ":";

            if (providerName.Equals("Env:", StringComparison.OrdinalIgnoreCase))
            {
                Environment.SetEnvironmentVariable(name, value);
                return true;
            }

            if (providerName.Equals("Variable:", StringComparison.OrdinalIgnoreCase))
            {
                ShellState.Set(name, value);
                return true;
            }

            return false;
        }

        public static bool Remove(string drive, string name)
        {
            string providerName = drive.Trim();
            if (!providerName.EndsWith(":", StringComparison.Ordinal))
                providerName += ":";

            if (providerName.Equals("Env:", StringComparison.OrdinalIgnoreCase))
            {
                Environment.SetEnvironmentVariable(name, null);
                return true;
            }

            if (providerName.Equals("Variable:", StringComparison.OrdinalIgnoreCase))
                return ShellState.Remove(name);

            return false;
        }

        public static IEnumerable<ShellObject> Read(string drive, string? pattern = null)
        {
            string providerName = drive.Trim();
            if (!providerName.EndsWith(":", StringComparison.Ordinal))
                providerName += ":";

            if (providerName.Equals("Env:", StringComparison.OrdinalIgnoreCase))
            {
                foreach (System.Collections.DictionaryEntry item in Environment.GetEnvironmentVariables())
                {
                    string name = item.Key?.ToString() ?? "";
                    if (!string.IsNullOrEmpty(pattern) && !MatchesWildcard(name, pattern))
                        continue;

                    yield return new ShellObject(
                        new Dictionary<string, object?>
                        {
                            ["Name"] = name,
                            ["Value"] = item.Value?.ToString() ?? ""
                        });
                }

                yield break;
            }

            if (providerName.Equals("Variable:", StringComparison.OrdinalIgnoreCase))
            {
                foreach (KeyValuePair<string, string> item in ShellState.Variables)
                {
                    string name = item.Key;
                    if (!string.IsNullOrEmpty(pattern) && !MatchesWildcard(name, pattern))
                        continue;

                    yield return new ShellObject(
                        new Dictionary<string, object?>
                        {
                            ["Name"] = item.Key,
                            ["Value"] = item.Value
                        });
                }

                yield break;
            }

            if (providerName.Equals("FileSystem:", StringComparison.OrdinalIgnoreCase))
            {
                string root = Directory.GetCurrentDirectory();
                string searchPattern = string.IsNullOrWhiteSpace(pattern) ? "*" : pattern.Trim();
                string directoryPath = root;
                string filePattern = searchPattern;

                if (searchPattern.Contains('/') || searchPattern.Contains('\\'))
                {
                    string normalized = searchPattern.Replace('/', Path.DirectorySeparatorChar)
                        .Replace('\\', Path.DirectorySeparatorChar);

                    string? pathPart = Path.GetDirectoryName(normalized);
                    if (!string.IsNullOrWhiteSpace(pathPart))
                    {
                        directoryPath = Path.IsPathRooted(pathPart)
                            ? pathPart
                            : Path.Combine(root, pathPart);
                        filePattern = Path.GetFileName(normalized);
                    }
                }

                if (!Directory.Exists(directoryPath))
                    yield break;

                foreach (string path in Directory.EnumerateFileSystemEntries(directoryPath, filePattern,
                    SearchOption.TopDirectoryOnly))
                {
                    FileSystemInfo info = Directory.Exists(path)
                        ? new DirectoryInfo(path)
                        : new FileInfo(path);

                    if (!MatchesWildcard(info.Name, filePattern) && !MatchesWildcard(info.FullName, searchPattern))
                        continue;

                    yield return new ShellObject(
                        new Dictionary<string, object?>
                        {
                            ["Name"] = info.Name,
                            ["FullName"] = info.FullName,
                            ["Type"] = info is DirectoryInfo ? "Directory" : "File",
                            ["LastWriteTime"] = info.LastWriteTime
                        });
                }
            }
        }

        private static bool MatchesWildcard(string value, string pattern)
        {
            if (string.IsNullOrEmpty(pattern) || pattern == "*")
                return true;

            string escaped = RegexEscape(pattern);
            string regex = "^" + escaped
                .Replace("\\*", ".*")
                .Replace("\\?", ".") + "$";

            return System.Text.RegularExpressions.Regex.IsMatch(value, regex,
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }

        private static string RegexEscape(string value)
        {
            return System.Text.RegularExpressions.Regex.Escape(value);
        }
    }
}
