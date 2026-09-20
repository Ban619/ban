using System;
using System.IO;

namespace Essentials.Configuration
{
    public sealed class ShellConfiguration
    {
        public string Prompt { get; set; } = "ban> ";
        public bool HistoryEnabled { get; set; } = true;
        public int MaxHistoryEntries { get; set; } = 100;
        public string HistoryFile { get; set; } = ".ban_history";
        public ShellTheme Theme { get; set; } = new ShellTheme();

        public static ShellConfiguration Load()
        {
            return new ShellConfiguration();
        }

        private ShellConfiguration Normalize()
        {
            if (string.IsNullOrWhiteSpace(Prompt))
                Prompt = "ban> ";

            if (MaxHistoryEntries < 1)
                MaxHistoryEntries = 100;

            if (string.IsNullOrWhiteSpace(HistoryFile))
                HistoryFile = ".ban_history";

            Theme ??= new ShellTheme();
            return this;
        }
    }

    public sealed class ShellTheme
    {
        public ConsoleColor Command { get; set; } = ConsoleColor.DarkYellow;
        public ConsoleColor Argument { get; set; } = ConsoleColor.Cyan;
        public ConsoleColor Option { get; set; } = ConsoleColor.Yellow;
        public ConsoleColor SelectionForeground { get; set; } = ConsoleColor.Black;
        public ConsoleColor SelectionBackground { get; set; } = ConsoleColor.Gray;
        public ConsoleColor Error { get; set; } = ConsoleColor.Red;
        public ConsoleColor Success { get; set; } = ConsoleColor.Green;
        public ConsoleColor Warning { get; set; } = ConsoleColor.Yellow;
        public ConsoleColor Information { get; set; } = ConsoleColor.Cyan;
    }
}
