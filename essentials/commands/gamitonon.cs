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
                        "cd - alisdan imong current directory"
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
                        $"tabang: way tabang para ani '{args[0]}'."
                    );

                    Console.ResetColor();
                    break;
            }
        }

        private static void Ambot(
            List<string> args,
            List<string> ops)
        {
            Console.WriteLine("ambot command");

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
