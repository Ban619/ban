using System;
using System.Collections.Generic;
using System.IO;

namespace Essentials.Commands
{
    public static class Gamitonon
    {
        public static void Execute(
            string com,
            List<string> args,
            List<string> ops)
        {
            switch (com)
            {
                case "dinako":
                    Dinako();
                    break;

                case "oras":
                    Oras();
                    break;

                case "cd":
                    Cd(args);
                    break;

                case "himo":
                    Himo(args);
                    break;

                case "tanaw":
                    Tanaw(args);
                    break;

                case "igna":
                    Igna(args);
                    break;

                case "kopya":
                    Kopya(args);
                    break;

                case "balhin":
                    Balhin(args);
                    break;

                case "tabang":
                    Tabang(args);
                    break;

                case "ambot":
                    Ambot(args, ops);
                    break;

                default:
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"Error: the term '{com}' is not supported."
                    );

                    Console.ResetColor();
                    break;
            }
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

            string path = string.Join(" ", args);

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

            string path = string.Join(" ", args);

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
            List<string> args)
        {
            string path;

            if (args.Count == 0)
            {
                path = Directory.GetCurrentDirectory();
            }
            else
            {
                path = string.Join(" ", args);
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

                string[] directories =
                    Directory.GetDirectories(path);

                string[] files =
                    Directory.GetFiles(path);

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine("Folders:");

                Console.ResetColor();

                foreach (string directory in directories)
                {
                    Console.ForegroundColor =
                        ConsoleColor.Blue;

                    Console.WriteLine(
                        $"  {Path.GetFileName(directory)}"
                    );

                    Console.ResetColor();
                }

                Console.WriteLine();

                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine("Files:");

                Console.ResetColor();

                foreach (string file in files)
                {
                    Console.ForegroundColor =
                        ConsoleColor.White;

                    Console.WriteLine(
                        $"  {Path.GetFileName(file)}"
                    );

                    Console.ResetColor();
                }

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

            string source = args[0];

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
                if (!File.Exists(source))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"kopya: file not found: {source}"
                    );

                    Console.ResetColor();

                    return;
                }

                if (Directory.Exists(destination))
                {
                    destination =
                        Path.Combine(
                            destination,
                            Path.GetFileName(source)
                        );
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
            catch (IOException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"kopya: destination already exists or cannot be used: {destination}"
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

            string source = args[0];

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
                if (!File.Exists(source))
                {
                    Console.ForegroundColor =
                        ConsoleColor.Red;

                    Console.WriteLine(
                        $"balhin: file not found: {source}"
                    );

                    Console.ResetColor();

                    return;
                }

                if (Directory.Exists(destination))
                {
                    destination =
                        Path.Combine(
                            destination,
                            Path.GetFileName(source)
                        );
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
            catch (IOException)
            {
                Console.ForegroundColor =
                    ConsoleColor.Red;

                Console.WriteLine(
                    $"balhin: destination already exists or cannot be used: {destination}"
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

        private static void Tabang(
            List<string> args)
        {
            if (args.Count == 0)
            {
                Console.ForegroundColor =
                    ConsoleColor.Cyan;

                Console.WriteLine();
                Console.WriteLine("Available commands:");
                Console.WriteLine();

                Console.WriteLine(
                    "  cd       Change the current directory"
                );

                Console.WriteLine(
                    "  himo     Create a directory"
                );

                Console.WriteLine(
                    "  tanaw    List files and directories"
                );

                Console.WriteLine(
                    "  igna     Print text to the console"
                );

                Console.WriteLine(
                    "  kopya    Copy a file"
                );

                Console.WriteLine(
                    "  balhin   Move or rename a file"
                );

                Console.WriteLine(
                    "  dinako   Clear the screen"
                );

                Console.WriteLine(
                    "  oras     Show the current date and time"
                );

                Console.WriteLine(
                    "  ambot    Test arguments and options"
                );

                Console.WriteLine(
                    "  tabang   Show available commands"
                );

                Console.WriteLine(
                    "  exit     Exit Ban"
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
                    Console.WriteLine("Examples:");
                    Console.WriteLine(
                        "  cd .."
                    );
                    Console.WriteLine(
                        "  cd Documents"
                    );
                    Console.WriteLine(
                        "  cd C:\\Users"
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
                    Console.WriteLine("Examples:");
                    Console.WriteLine(
                        "  himo test"
                    );
                    Console.WriteLine(
                        "  himo Documents"
                    );
                    Console.WriteLine(
                        "  himo \"My Folder\""
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
                    Console.WriteLine("Examples:");
                    Console.WriteLine(
                        "  tanaw"
                    );
                    Console.WriteLine(
                        "  tanaw docs"
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
                    Console.WriteLine("Examples:");
                    Console.WriteLine(
                        "  igna Hello world"
                    );
                    Console.WriteLine(
                        "  igna Ban is running"
                    );
                    Console.WriteLine();
                    break;

                case "kopya":
                    Console.WriteLine();
                    Console.WriteLine(
                        "kopya - Copy a file"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  kopya <source> <destination>"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Examples:");
                    Console.WriteLine(
                        "  kopya test.txt backup.txt"
                    );
                    Console.WriteLine(
                        "  kopya test.txt docs"
                    );
                    Console.WriteLine();
                    break;

                case "balhin":
                    Console.WriteLine();
                    Console.WriteLine(
                        "balhin - Move or rename a file"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  balhin <source> <destination>"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Examples:");
                    Console.WriteLine(
                        "  balhin test.txt docs"
                    );
                    Console.WriteLine(
                        "  balhin old.txt new.txt"
                    );
                    Console.WriteLine();
                    break;

                case "dinako":
                    Console.WriteLine();
                    Console.WriteLine(
                        "dinako - Clear the screen"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  dinako"
                    );
                    Console.WriteLine();
                    break;

                case "oras":
                    Console.WriteLine();
                    Console.WriteLine(
                        "oras - Show the current date and time"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  oras"
                    );
                    Console.WriteLine();
                    break;

                case "ambot":
                    Console.WriteLine();
                    Console.WriteLine(
                        "ambot - Test arguments and options"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  ambot <arguments> <options>"
                    );
                    Console.WriteLine();
                    break;

                case "tabang":
                    Console.WriteLine();
                    Console.WriteLine(
                        "tabang - Show available commands"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  tabang"
                    );
                    Console.WriteLine(
                        "  tabang <command>"
                    );
                    Console.WriteLine();
                    break;

                case "exit":
                    Console.WriteLine();
                    Console.WriteLine(
                        "exit - Exit Ban"
                    );
                    Console.WriteLine();
                    Console.WriteLine("Usage:");
                    Console.WriteLine(
                        "  exit"
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
            Console.WriteLine("Ambot command");

            if (args.Count > 0)
            {
                Console.WriteLine("Arguments:");

                foreach (string argument in args)
                {
                    Console.WriteLine(
                        $"  {argument}"
                    );
                }
            }

            if (ops.Count > 0)
            {
                Console.WriteLine("options: ");

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
                Console.WriteLine("way sulod..");
            }
        }
    }
}
