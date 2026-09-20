using System;
using System.Collections.Generic;
using System.IO;
using Essentials.Configuration;

namespace Essentials.Commands
{
    public static class Gamitonon
    {
        private static readonly Dictionary<string, Action<List<string>, List<string>>> Commands =
            new Dictionary<string, Action<List<string>, List<string>>>(StringComparer.OrdinalIgnoreCase)
            {
                ["dinako"] = (_, __) => Dinako(),
                ["oras"] = (_, __) => Oras(),
                ["cd"] = (args, __) => Cd(args),
                ["himo"] = (args, __) => Himo(args),
                ["tanaw"] = (args, ops) => Tanaw(args, ops),
                ["familytree"] = (args, __) => FamilyTree(args),
                ["igna"] = (args, __) => Igna(args),
                ["kopya"] = (args, __) => Kopya(args),
                ["balhin"] = (args, __) => Balhin(args),
                ["del"] = (args, __) => Del(args),
                ["basaha"] = (args, ops) => Basaha(args, ops),
                ["sulat"] = (args, __) => Sulat(args),
                ["dugang"] = (args, __) => Dugang(args),
                ["pangita"] = (args, ops) => Pangita(args, ops),
                ["impormasyon"] = (args, __) => Impormasyon(args),
                ["ngalan"] = (args, __) => Ngalan(args),
                ["history"] = (_, __) => History(),
                ["tabang"] = (args, __) => Tabang(args),
                ["bersyon"] = (_, __) => Bersyon(),
                ["ambot"] = (args, ops) => Ambot(args, ops)
            };

        private static readonly Dictionary<string, string> Descriptions =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["dinako"] = "Clear the screen",
                ["oras"] = "Show the current date and time",
                ["cd"] = "Change the current directory",
                ["himo"] = "Create a directory",
                ["tanaw"] = "List files and directories",
                ["familytree"] = "Display the directory tree",
                ["igna"] = "Print text to the console",
                ["kopya"] = "Copy files and directories",
                ["balhin"] = "Move or rename files and directories",
                ["del"] = "Delete files and directories",
                ["basaha"] = "Read a file",
                ["sulat"] = "Create or write to a file",
                ["dugang"] = "Append text to a file",
                ["pangita"] = "Search text inside a file",
                ["impormasyon"] = "Show file or directory information",
                ["ngalan"] = "Rename a file or directory",
                ["history"] = "Show command history",
                ["tabang"] = "Show available commands",
                ["bersyon"] = "Show Ban version information",
                ["ambot"] = "Test arguments and options"
            };

        public static IEnumerable<string> GetCommandNames()
        {
            return Commands.Keys;
        }

        public static bool TryGetDescription(
            string command,
            out string description)
        {
            return Descriptions.TryGetValue(command, out description!);
        }

        public static int Execute(
            string com,
            List<string> args,
            List<string> ops)
        {
            if (string.IsNullOrWhiteSpace(com))
                return 0;

            if (Commands.TryGetValue(com, out Action<List<string>, List<string>>? command))
            {
                try
                {
                    command(args, ops);
                }
                catch (Exception ex)
                {
                    ShellOutput.Error($"{com}: {ex.Message}");
                }

                return ShellOutput.LastExitCode;
            }

            ShellOutput.Error($"Error: the term '{com}' is not supported.");
            return ShellOutput.LastExitCode;
        }

        private static void Dinako()
        {
            Console.Clear();
        }

        private static void Oras()
        {
            Console.ForegroundColor =
                ConsoleColor.Cyan;

            Console.WriteLine(DateTime.Now);

            Console.ResetColor();
        }

        private static void Cd(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.WriteLine(
                    Directory.GetCurrentDirectory()
                );

                return;
            }

            string path =
                string.Join(" ", args);

            try
            {
                Directory.SetCurrentDirectory(path);
            }
            catch (DirectoryNotFoundException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"cd: directory not found: {path}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"cd: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"cd: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Himo(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "himo: missing directory name."
                );

                Console.ResetColor();

                return;
            }

            string path =
                string.Join(" ", args);

            try
            {
                if (Directory.Exists(path))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Yellow;

                    Console.WriteLine(
                        $"himo: directory already exists: {path}"
                    );

                    Console.ResetColor();

                    return;
                }

                Directory.CreateDirectory(path);

                Console.ForegroundColor =
                    ConsoleColor.Green;

                Console.WriteLine(
                    $"Directory created: {path}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"himo: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Tanaw(
            List<string> args,
            List<string> ops)
        {
            string path;

            bool showHidden = false;
            bool detailed = false;

            foreach (string option in ops)
            {
                if (option.Equals(
                    "-a",
                    StringComparison.OrdinalIgnoreCase))
                {
                    showHidden = true;
                }

                if (option.Equals(
                    "-l",
                    StringComparison.OrdinalIgnoreCase))
                {
                    detailed = true;
                }
            }

            if (args.Count == 0)
            {
                path =
                    Directory.GetCurrentDirectory();
            }
            else
            {
                path =
                    string.Join(" ", args);
            }

            try
            {
                if (!Directory.Exists(path))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"tanaw: directory not found: {path}"
                    );

                    Console.ResetColor();

                    return;
                }

                DirectoryInfo directory =
                    new DirectoryInfo(path);

                DirectoryInfo[] directories =
                    directory.GetDirectories();

                FileInfo[] files =
                    directory.GetFiles();

                List<DirectoryInfo> visibleDirectories =
                    new List<DirectoryInfo>();

                List<FileInfo> visibleFiles =
                    new List<FileInfo>();

                foreach (DirectoryInfo item in directories)
                {
                    if (showHidden || !IsHidden(item))
                    {
                        visibleDirectories.Add(item);
                    }
                }

                foreach (FileInfo item in files)
                {
                    if (showHidden || !IsHidden(item))
                    {
                        visibleFiles.Add(item);
                    }
                }

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine(
                    $"Directory: {directory.FullName}"
                );

                Console.ResetColor();

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine(
                    "Folders:"
                );

                Console.ResetColor();

                if (visibleDirectories.Count == 0)
                {
                    Console.WriteLine(
                        "  (none)"
                    );
                }

                foreach (DirectoryInfo item
                    in visibleDirectories)
                {
                    Console.ForegroundColor =
                        ConsoleColor.Blue;

                    if (detailed)
                    {
                        Console.WriteLine(
                            $"  {item.Name,-30} <DIR>    {item.LastWriteTime}"
                        );
                    }
                    else
                    {
                        Console.WriteLine(
                            $"  {item.Name}"
                        );
                    }

                    Console.ResetColor();
                }

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine(
                    "Files:"
                );

                Console.ResetColor();

                if (visibleFiles.Count == 0)
                {
                    Console.WriteLine(
                        "  (none)"
                    );
                }

                foreach (FileInfo item
                    in visibleFiles)
                {
                    Console.ForegroundColor =
                        ConsoleColor.White;

                    if (detailed)
                    {
                        Console.WriteLine(
                            $"  {item.Name,-30} {FormatSize(item.Length),10}    {item.LastWriteTime}"
                        );
                    }
                    else
                    {
                        Console.WriteLine(
                            $"  {item.Name}"
                        );
                    }

                    Console.ResetColor();
                }

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.DarkGray;

                Console.WriteLine(
                    $"  {visibleDirectories.Count} folder(s), {visibleFiles.Count} file(s)"
                );

                Console.ResetColor();

                Console.WriteLine();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"tanaw: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"tanaw: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static bool IsHidden(
            FileSystemInfo item)
        {
            return (
                item.Attributes &
                FileAttributes.Hidden
            ) != 0;
        }

        private static string FormatSize(
            long bytes)
        {
            if (bytes < 1024)
                return $"{bytes} B";

            if (bytes < 1024 * 1024)
                return $"{bytes / 1024.0:F1} KB";

            if (bytes <
                1024L * 1024L * 1024L)
            {
                return
                    $"{bytes / (1024.0 * 1024.0):F1} MB";
            }

            return
                $"{bytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
        }

        private static void FamilyTree(
            List<string> args)
        {
            string path;

            if (args.Count == 0)
            {
                path =
                    Directory.GetCurrentDirectory();
            }
            else
            {
                path =
                    string.Join(" ", args);
            }

            try
            {
                if (!Directory.Exists(path))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"familytree: directory not found: {path}"
                    );

                    Console.ResetColor();

                    return;
                }

                DirectoryInfo directory =
                    new DirectoryInfo(path);

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine(
                    directory.Name
                );

                Console.ResetColor();

                PrintTree(
                    directory,
                    ""
                );

                Console.WriteLine();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"familytree: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"familytree: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void PrintTree(
            DirectoryInfo directory,
            string indent)
        {
            DirectoryInfo[] directories;
            FileInfo[] files;

            try
            {
                directories =
                    directory.GetDirectories();

                files =
                    directory.GetFiles();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"{indent}└── [Access Denied]"
                );

                Console.ResetColor();

                return;
            }

            int total =
                directories.Length +
                files.Length;

            int current = 0;

            foreach (DirectoryInfo child
                in directories)
            {
                current++;

                bool last =
                    current == total;

                Console.Write(indent);

                Console.Write(
                    last
                        ? "└── "
                        : "├── "
                );

                Console.ForegroundColor =
                    ConsoleColor.Blue;

                Console.WriteLine(
                    child.Name
                );

                Console.ResetColor();

                string nextIndent =
                    indent +
                    (last ? "    " : "│   ");

                PrintTree(
                    child,
                    nextIndent
                );
            }

            foreach (FileInfo file
                in files)
            {
                current++;

                bool last =
                    current == total;

                Console.Write(indent);

                Console.Write(
                    last
                        ? "└── "
                        : "├── "
                );

                Console.ForegroundColor =
                    ConsoleColor.White;

                Console.WriteLine(
                    file.Name
                );

                Console.ResetColor();
            }
        }

        private static void Igna(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.WriteLine();
                return;
            }

            Console.WriteLine(
                string.Join(" ", args)
            );
        }

        private static void Kopya(
            List<string> args)
        {
            if (args.Count < 2)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "kopya: source and destination are required."
                );

                Console.ResetColor();

                return;
            }

            string source =
                args[0];

            string destination =
                string.Join(
                    " ",
                    args.GetRange(
                        1,
                        args.Count - 1
                    )
                );

            try
            {
                if (File.Exists(source))
                {
                    CopyFile(
                        source,
                        destination
                    );

                    return;
                }

                if (Directory.Exists(source))
                {
                    CopyDirectory(
                        source,
                        destination
                    );

                    return;
                }

                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"kopya: source not found: {source}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "kopya: access denied."
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"kopya: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"kopya: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void CopyFile(
            string source,
            string destination)
        {
            if (Directory.Exists(destination))
            {
                destination =
                    Path.Combine(
                        destination,
                        Path.GetFileName(source)
                    );
            }

            if (File.Exists(destination))
            {
                Console.ForegroundColor =
                    ConsoleColor.Yellow;

                Console.WriteLine(
                    $"kopya: destination already exists: {destination}"
                );

                Console.ResetColor();

                return;
            }

            File.Copy(
                source,
                destination
            );

            Console.ForegroundColor =
                ConsoleColor.Green;

            Console.WriteLine(
                $"Copied: {source} -> {destination}"
            );

            Console.ResetColor();
        }

        private static void CopyDirectory(
            string source,
            string destination)
        {
            DirectoryInfo sourceInfo =
                new DirectoryInfo(source);

            if (Directory.Exists(destination))
            {
                destination =
                    Path.Combine(
                        destination,
                        sourceInfo.Name
                    );
            }

            if (Directory.Exists(destination))
            {
                Console.ForegroundColor =
                    ConsoleColor.Yellow;

                Console.WriteLine(
                    $"kopya: destination already exists: {destination}"
                );

                Console.ResetColor();

                return;
            }

            Directory.CreateDirectory(
                destination
            );

            foreach (FileInfo file
                in sourceInfo.GetFiles())
            {
                string target =
                    Path.Combine(
                        destination,
                        file.Name
                    );

                File.Copy(
                    file.FullName,
                    target
                );
            }

            foreach (DirectoryInfo directory
                in sourceInfo.GetDirectories())
            {
                string target =
                    Path.Combine(
                        destination,
                        directory.Name
                    );

                CopyDirectory(
                    directory.FullName,
                    target
                );
            }

            Console.ForegroundColor =
                ConsoleColor.Green;

            Console.WriteLine(
                $"Copied directory: {source} -> {destination}"
            );

            Console.ResetColor();
        }

        private static void Balhin(
            List<string> args)
        {
            if (args.Count < 2)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "balhin: source and destination are required."
                );

                Console.ResetColor();

                return;
            }

            string source =
                args[0];

            string destination =
                string.Join(
                    " ",
                    args.GetRange(
                        1,
                        args.Count - 1
                    )
                );

            try
            {
                if (File.Exists(source))
                {
                    MoveFile(
                        source,
                        destination
                    );

                    return;
                }

                if (Directory.Exists(source))
                {
                    MoveDirectory(
                        source,
                        destination
                    );

                    return;
                }

                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"balhin: source not found: {source}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "balhin: access denied."
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"balhin: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"balhin: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void MoveFile(
            string source,
            string destination)
        {
            if (Directory.Exists(destination))
            {
                destination =
                    Path.Combine(
                        destination,
                        Path.GetFileName(source)
                    );
            }

            if (File.Exists(destination) ||
                Directory.Exists(destination))
            {
                Console.ForegroundColor =
                    ConsoleColor.Yellow;

                Console.WriteLine(
                    $"balhin: destination already exists: {destination}"
                );

                Console.ResetColor();

                return;
            }

            File.Move(
                source,
                destination
            );

            Console.ForegroundColor =
                ConsoleColor.Green;

            Console.WriteLine(
                $"Moved: {source} -> {destination}"
            );

            Console.ResetColor();
        }

        private static void MoveDirectory(
            string source,
            string destination)
        {
            DirectoryInfo sourceInfo =
                new DirectoryInfo(source);

            if (Directory.Exists(destination))
            {
                destination =
                    Path.Combine(
                        destination,
                        sourceInfo.Name
                    );
            }

            if (Directory.Exists(destination) ||
                File.Exists(destination))
            {
                Console.ForegroundColor =
                    ConsoleColor.Yellow;

                Console.WriteLine(
                    $"balhin: destination already exists: {destination}"
                );

                Console.ResetColor();

                return;
            }

            Directory.Move(
                source,
                destination
            );

            Console.ForegroundColor =
                ConsoleColor.Green;

            Console.WriteLine(
                $"Moved directory: {source} -> {destination}"
            );

            Console.ResetColor();
        }

        private static void Del(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "del: missing file or directory."
                );

                Console.ResetColor();

                return;
            }

            string path =
                string.Join(" ", args);

            try
            {
                if (File.Exists(path))
                {
                    File.Delete(path);

                    Console.ForegroundColor =
                        ConsoleColor.Green;

                    Console.WriteLine(
                        $"Deleted: {path}"
                    );

                    Console.ResetColor();

                    return;
                }

                if (Directory.Exists(path))
                {
                    Directory.Delete(
                        path,
                        true
                    );

                    Console.ForegroundColor =
                        ConsoleColor.Green;

                    Console.WriteLine(
                        $"Deleted directory: {path}"
                    );

                    Console.ResetColor();

                    return;
                }

                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"del: file or directory not found: {path}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "del: access denied."
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"del: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"del: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Basaha(
            List<string> args,
            List<string> ops)
        {
            if (args.Count == 0)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "basaha: missing file name."
                );

                Console.ResetColor();

                return;
            }

            string path =
                string.Join(" ", args);

            bool lineNumbers = false;

            foreach (string option in ops)
            {
                if (option.Equals(
                    "-n",
                    StringComparison.OrdinalIgnoreCase))
                {
                    lineNumbers = true;
                }
            }

            if (!File.Exists(path))
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"basaha: file not found: {path}"
                );

                Console.ResetColor();

                return;
            }

            try
            {
                string[] lines =
                    File.ReadAllLines(path);

                for (int i = 0;
                    i < lines.Length;
                    i++)
                {
                    if (lineNumbers)
                    {
                        Console.ForegroundColor =
                            ConsoleColor.DarkGray;

                        Console.Write(
                            $"{i + 1,4} | "
                        );

                        Console.ResetColor();
                    }

                    Console.WriteLine(
                        lines[i]
                    );
                }
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"basaha: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"basaha: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"basaha: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Sulat(
            List<string> args)
        {
            if (args.Count < 2)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "sulat: file name and text are required."
                );

                Console.ResetColor();

                return;
            }

            string path =
                args[0];

            string text =
                string.Join(
                    " ",
                    args.GetRange(
                        1,
                        args.Count - 1
                    )
                );

            try
            {
                File.WriteAllText(
                    path,
                    text
                );

                Console.ForegroundColor =
                    ConsoleColor.Green;

                Console.WriteLine(
                    $"Written: {path}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"sulat: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"sulat: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"sulat: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Dugang(
            List<string> args)
        {
            if (args.Count < 2)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "dugang: file name and text are required."
                );

                Console.ResetColor();

                return;
            }

            string path =
                args[0];

            string text =
                string.Join(
                    " ",
                    args.GetRange(
                        1,
                        args.Count - 1
                    )
                );

            try
            {
                File.AppendAllText(
                    path,
                    Environment.NewLine + text
                );

                Console.ForegroundColor =
                    ConsoleColor.Green;

                Console.WriteLine(
                    $"Appended: {path}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"dugang: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"dugang: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"dugang: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Pangita(
            List<string> args,
            List<string> ops)
        {
            if (args.Count < 2)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "pangita: search text and file name are required."
                );

                Console.ResetColor();

                return;
            }

            string search =
                args[0];

            string path =
                string.Join(
                    " ",
                    args.GetRange(
                        1,
                        args.Count - 1
                    )
                );

            bool caseSensitive = false;

            foreach (string option in ops)
            {
                if (option.Equals(
                    "-c",
                    StringComparison.OrdinalIgnoreCase))
                {
                    caseSensitive = true;
                }
            }

            if (!File.Exists(path))
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"pangita: file not found: {path}"
                );

                Console.ResetColor();

                return;
            }

            try
            {
                string[] lines =
                    File.ReadAllLines(path);

                StringComparison comparison =
                    caseSensitive
                        ? StringComparison.Ordinal
                        : StringComparison.OrdinalIgnoreCase;

                int matches = 0;

                for (int i = 0;
                    i < lines.Length;
                    i++)
                {
                    if (lines[i].IndexOf(
                        search,
                        comparison
                    ) >= 0)
                    {
                        matches++;

                        Console.ForegroundColor =
                            ConsoleColor.DarkGray;

                        Console.Write(
                            $"{i + 1,4} | "
                        );

                        Console.ResetColor();

                        Console.WriteLine(
                            lines[i]
                        );
                    }
                }

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine();

                Console.WriteLine(
                    $"{matches} match(es) found."
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"pangita: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"pangita: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"pangita: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Impormasyon(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "impormasyon: missing file or directory."
                );

                Console.ResetColor();

                return;
            }

            string path =
                string.Join(" ", args);

            try
            {
                if (File.Exists(path))
                {
                    FileInfo file =
                        new FileInfo(path);

                    Console.WriteLine();

                    Console.ForegroundColor =
                        ConsoleColor.Cyan;

                    Console.WriteLine(
                        "File Information"
                    );

                    Console.ResetColor();

                    Console.WriteLine(
                        $"Name:          {file.Name}"
                    );

                    Console.WriteLine(
                        $"Full path:     {file.FullName}"
                    );

                    Console.WriteLine(
                        $"Type:          File"
                    );

                    Console.WriteLine(
                        $"Size:          {FormatSize(file.Length)}"
                    );

                    Console.WriteLine(
                        $"Created:       {file.CreationTime}"
                    );

                    Console.WriteLine(
                        $"Modified:      {file.LastWriteTime}"
                    );

                    Console.WriteLine(
                        $"Accessed:      {file.LastAccessTime}"
                    );

                    Console.WriteLine(
                        $"Attributes:    {file.Attributes}"
                    );

                    Console.WriteLine();

                    return;
                }

                if (Directory.Exists(path))
                {
                    DirectoryInfo directory =
                        new DirectoryInfo(path);

                    Console.WriteLine();

                    Console.ForegroundColor =
                        ConsoleColor.Cyan;

                    Console.WriteLine(
                        "Directory Information"
                    );

                    Console.ResetColor();

                    Console.WriteLine(
                        $"Name:          {directory.Name}"
                    );

                    Console.WriteLine(
                        $"Full path:     {directory.FullName}"
                    );

                    Console.WriteLine(
                        $"Type:          Directory"
                    );

                    Console.WriteLine(
                        $"Created:       {directory.CreationTime}"
                    );

                    Console.WriteLine(
                        $"Modified:      {directory.LastWriteTime}"
                    );

                    Console.WriteLine(
                        $"Accessed:      {directory.LastAccessTime}"
                    );

                    Console.WriteLine(
                        $"Attributes:    {directory.Attributes}"
                    );

                    try
                    {
                        int folders =
                            directory.GetDirectories().Length;

                        int files =
                            directory.GetFiles().Length;

                        Console.WriteLine(
                            $"Folders:       {folders}"
                        );

                        Console.WriteLine(
                            $"Files:         {files}"
                        );
                    }
                    catch (UnauthorizedAccessException)
                    {
                        Console.WriteLine(
                            "Contents:      Access denied"
                        );
                    }

                    Console.WriteLine();

                    return;
                }

                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"impormasyon: '{path}' does not exist."
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"impormasyon: access denied: {path}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"impormasyon: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void Ngalan(
            List<string> args)
        {
            if (args.Count < 2)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "ngalan: old name and new name are required."
                );

                Console.ResetColor();

                return;
            }

            string source =
                args[0];

            string destination =
                string.Join(
                    " ",
                    args.GetRange(
                        1,
                        args.Count - 1
                    )
                );

            try
            {
                if (!File.Exists(source) &&
                    !Directory.Exists(source))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"ngalan: '{source}' does not exist."
                    );

                    Console.ResetColor();

                    return;
                }

                if (File.Exists(destination) ||
                    Directory.Exists(destination))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Yellow;

                    Console.WriteLine(
                        $"ngalan: destination already exists: {destination}"
                    );

                    Console.ResetColor();

                    return;
                }

                if (File.Exists(source))
                {
                    File.Move(
                        source,
                        destination
                    );
                }
                else
                {
                    Directory.Move(
                        source,
                        destination
                    );
                }

                Console.ForegroundColor =
                    ConsoleColor.Green;

                Console.WriteLine(
                    $"Renamed: {source} -> {destination}"
                );

                Console.ResetColor();
            }
            catch (UnauthorizedAccessException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    "ngalan: access denied."
                );

                Console.ResetColor();
            }
            catch (IOException ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"ngalan: {ex.Message}"
                );

                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"ngalan: {ex.Message}"
                );

                Console.ResetColor();
            }
        }

        private static void History()
        {
            List<string> history =
                Essentials.Input.Editour.GetHistory();

            if (history.Count == 0)
            {
                Console.WriteLine(
                    "No command history."
                );

                return;
            }

            for (int i = 0;
                i < history.Count;
                i++)
            {
                Console.WriteLine(
                    $"  {i + 1,3}  {history[i]}"
                );
            }
        }

        private static void Bersyon()
        {
            Console.ForegroundColor =
                ConsoleColor.Cyan;

            Console.WriteLine();
            Console.WriteLine(
                "Ban Command Line"
            );

            Console.WriteLine(
                "Version 0.1.0"
            );

            Console.WriteLine();

            Console.ResetColor();
        }

        private static void Tabang(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine();
                Console.WriteLine(
                    "Available commands:"
                );
                Console.WriteLine();

                Console.WriteLine(
                    "  cd             Change the current directory"
                );

                Console.WriteLine(
                    "  himo           Create a directory"
                );

                Console.WriteLine(
                    "  tanaw          List files and directories"
                );

                Console.WriteLine(
                    "  familytree     Display the directory tree"
                );

                Console.WriteLine(
                    "  igna           Print text to the console"
                );

                Console.WriteLine(
                    "  kopya          Copy files and directories"
                );

                Console.WriteLine(
                    "  balhin         Move files and directories"
                );

                Console.WriteLine(
                    "  del            Delete files and directories"
                );

                Console.WriteLine(
                    "  basaha         Read a file"
                );

                Console.WriteLine(
                    "  sulat          Create or write to a file"
                );

                Console.WriteLine(
                    "  dugang         Append text to a file"
                );

                Console.WriteLine(
                    "  pangita        Search text inside a file"
                );

                Console.WriteLine(
                    "  impormasyon    Show file or directory information"
                );

                Console.WriteLine(
                    "  ngalan         Rename a file or directory"
                );

                Console.WriteLine(
                    "  history        Show command history"
                );

                Console.WriteLine(
                    "  dinako         Clear the screen"
                );

                Console.WriteLine(
                    "  oras           Show the current date and time"
                );

                Console.WriteLine(
                    "  ambot          Test arguments and options"
                );

                Console.WriteLine(
                    "  tabang         Show available commands"
                );

                Console.WriteLine(
                    "  bersyon        Show Ban version information"
                );

                Console.WriteLine(
                    "  exit            Exit Ban"
                );

                Console.WriteLine();

                Console.ResetColor();

                return;
            }

            string command =
                args[0].ToLower();

            switch (command)
            {
                case "cd":
                    Console.WriteLine();
                    Console.WriteLine(
                        "cd - Change the current directory"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  cd <directory>"
                    );
                    Console.WriteLine();
                    break;

                case "himo":
                    Console.WriteLine();
                    Console.WriteLine(
                        "himo - Create a directory"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  himo <directory>"
                    );
                    Console.WriteLine();
                    break;

                case "tanaw":
                    Console.WriteLine();
                    Console.WriteLine(
                        "tanaw - List files and directories"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  tanaw"
                    );
                    Console.WriteLine(
                        "  tanaw <directory>"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Options:");
                    Console.WriteLine(
                        "  -a    Show hidden files"
                    );
                    Console.WriteLine(
                        "  -l    Show detailed information"
                    );
                    Console.WriteLine();
                    break;

                case "familytree":
                    Console.WriteLine();
                    Console.WriteLine(
                        "familytree - Display the directory tree"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  familytree"
                    );
                    Console.WriteLine(
                        "  familytree <directory>"
                    );
                    Console.WriteLine();
                    break;

                case "igna":
                    Console.WriteLine();
                    Console.WriteLine(
                        "igna - Print text to the console"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  igna <text>"
                    );
                    Console.WriteLine();
                    break;

                case "kopya":
                    Console.WriteLine();
                    Console.WriteLine(
                        "kopya - Copy files and directories"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  kopya <source> <destination>"
                    );
                    Console.WriteLine();
                    break;

                case "balhin":
                    Console.WriteLine();
                    Console.WriteLine(
                        "balhin - Move or rename files and directories"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  balhin <source> <destination>"
                    );
                    Console.WriteLine();
                    break;

                case "del":
                    Console.WriteLine();
                    Console.WriteLine(
                        "del - Delete files and directories"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  del <file-or-directory>"
                    );
                    Console.WriteLine();
                    break;

                case "basaha":
                    Console.WriteLine();
                    Console.WriteLine(
                        "basaha - Read a file"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  basaha <file>"
                    );
                    Console.WriteLine(
                        "  basaha <file> -n"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Options:");
                    Console.WriteLine(
                        "  -n    Show line numbers"
                    );
                    Console.WriteLine();
                    break;

                case "sulat":
                    Console.WriteLine();
                    Console.WriteLine(
                        "sulat - Create or write to a file"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  sulat <file> <text>"
                    );
                    Console.WriteLine();
                    break;

                case "dugang":
                    Console.WriteLine();
                    Console.WriteLine(
                        "dugang - Append text to a file"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  dugang <file> <text>"
                    );
                    Console.WriteLine();
                    break;

                case "pangita":
                    Console.WriteLine();
                    Console.WriteLine(
                        "pangita - Search text inside a file"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  pangita <text> <file>"
                    );
                    Console.WriteLine(
                        "  pangita <text> <file> -c"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Options:");
                    Console.WriteLine(
                        "  -c    Case-sensitive search"
                    );
                    Console.WriteLine();
                    break;

                case "impormasyon":
                    Console.WriteLine();
                    Console.WriteLine(
                        "impormasyon - Show file or directory information"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  impormasyon <file-or-directory>"
                    );
                    Console.WriteLine();
                    break;

                case "ngalan":
                    Console.WriteLine();
                    Console.WriteLine(
                        "ngalan - Rename a file or directory"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  ngalan <old-name> <new-name>"
                    );
                    Console.WriteLine();
                    break;

                case "history":
                    Console.WriteLine();
                    Console.WriteLine(
                        "history - Show command history"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  history"
                    );
                    Console.WriteLine();
                    break;

                case "dinako":
                    Console.WriteLine();
                    Console.WriteLine(
                        "dinako - Clear the screen"
                    );
                    Console.WriteLine();
                    break;

                case "oras":
                    Console.WriteLine();
                    Console.WriteLine(
                        "oras - Show the current date and time"
                    );
                    Console.WriteLine();
                    break;

                case "ambot":
                    Console.WriteLine();
                    Console.WriteLine(
                        "ambot - Test arguments and options"
                    );
                    Console.WriteLine();
                    break;

                case "tabang":
                    Console.WriteLine();
                    Console.WriteLine(
                        "tabang - Show available commands"
                    );
                    Console.WriteLine();
                    break;

                case "bersyon":
                    Console.WriteLine();
                    Console.WriteLine(
                        "bersyon - Show Ban version information"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  bersyon"
                    );
                    Console.WriteLine();
                    break;

                case "exit":
                    Console.WriteLine();
                    Console.WriteLine(
                        "exit - Exit Ban"
                    );
                    Console.WriteLine();
                    break;

                default:
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"tabang: no help available for '{args[0]}'."
                    );

                    Console.ResetColor();
                    break;
            }
        }

        private static void Ambot(
            List<string> args,
            List<string> ops)
        {
            Console.WriteLine(
                "Ambot command"
            );

            if (args.Count > 0)
            {
                Console.WriteLine(
                    "Arguments:"
                );

                foreach (string argument in args)
                {
                    Console.WriteLine(
                        $"  {argument}"
                    );
                }
            }

            if (ops.Count > 0)
            {
                Console.WriteLine(
                    "options: "
                );

                foreach (string option in ops)
                {
                    Console.WriteLine(
                        $"  {option}"
                    );
                }
            }

            if (args.Count == 0 &&
                ops.Count == 0)
            {
                Console.WriteLine(
                    "way sulod.."
                );
            }
        }
    }
}
