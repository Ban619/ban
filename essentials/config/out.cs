using System;

namespace Essentials.Configuration
{
    public static class ShellOutput
    {
        private static ShellConfiguration configuration = new ShellConfiguration();

        public static int LastExitCode { get; private set; }

        public static void Initialize(ShellConfiguration shellConfiguration)
        {
            configuration = shellConfiguration;
        }

        public static void ResetExitCode()
        {
            LastExitCode = 0;
        }

        public static void Error(string message, int exitCode = 1)
        {
            LastExitCode = exitCode;
            Write(message, configuration.Theme.Error);
        }

        public static void Warning(string message)
        {
            Write(message, configuration.Theme.Warning);
        }

        public static void Success(string message)
        {
            Write(message, configuration.Theme.Success);
        }

        public static void Information(string message)
        {
            Write(message, configuration.Theme.Information);
        }

        private static void Write(string message, ConsoleColor color)
        {
            ConsoleColor previous = Console.ForegroundColor;
            Console.ForegroundColor = color;
            Console.WriteLine(message);
            Console.ForegroundColor = previous;
        }
    }
}
