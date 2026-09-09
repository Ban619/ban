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
