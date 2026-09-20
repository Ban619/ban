using System;
using System.Collections.Generic;
using System.IO;
using Essentials.Configuration;
using Essentials.Commands;
using Essentials.Jortcut;

namespace Essentials.Input
{
    public static class Editour
    {
        private static string clipboard = "";
        private static ShellConfiguration configuration = new ShellConfiguration();
        private static int renderedLength;
        private static int renderedWidth;
        private static int renderedRow;
        private static int renderedColumn;

        private static readonly List<string> history =
            new List<string>();

        private static int historyIndex = -1;

        private static string CommandColor = "\x1b[38;2;210;180;140m";
        private static string ArgumentColor = "\x1b[38;2;80;200;220m";
        private static string OptionColor = "\x1b[38;2;230;200;80m";

        private const string ResetColor =
            "\x1b[0m";

        private static string SelectionColor =
            "\x1b[30;47m";

        public static void Initialize(ShellConfiguration shellConfiguration)
        {
            configuration = shellConfiguration;
            CommandColor = ToAnsiForeground(configuration.Theme.Command);
            ArgumentColor = ToAnsiForeground(configuration.Theme.Argument);
            OptionColor = ToAnsiForeground(configuration.Theme.Option);
            SelectionColor = ToAnsiSelection(
                configuration.Theme.SelectionForeground,
                configuration.Theme.SelectionBackground);

            history.Clear();
            historyIndex = -1;

            if (!configuration.HistoryEnabled)
                return;

            string path = GetHistoryPath();

            try
            {
                if (File.Exists(path))
                {
                    foreach (string line in File.ReadLines(path))
                    {
                        if (!string.IsNullOrWhiteSpace(line))
                            history.Add(line);
                    }

                    TrimHistory();
                }
            }
            catch (IOException)
            {
            }
        }

        public static void SaveHistory()
        {
            if (!configuration.HistoryEnabled)
                return;

            try
            {
                File.WriteAllLines(GetHistoryPath(), history);
            }
            catch (IOException)
            {
            }
        }

        public static void AddHistory(string command)
        {
            if (string.IsNullOrWhiteSpace(command))
                return;

            command = command.Trim();

            if (history.Count > 0 &&
                history[history.Count - 1]
                    .Equals(
                        command,
                        StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            history.Add(command);
            TrimHistory();

            historyIndex = history.Count;
        }

        public static List<string> GetHistory()
        {
            return new List<string>(history);
        }

        private static string GetHistoryPath()
        {
            if (Path.IsPathRooted(configuration.HistoryFile))
                return configuration.HistoryFile;

            string directory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Y");

            Directory.CreateDirectory(directory);
            return Path.Combine(directory, configuration.HistoryFile);
        }

        private static void TrimHistory()
        {
            while (history.Count > configuration.MaxHistoryEntries)
                history.RemoveAt(0);
        }

        private static string ToAnsiForeground(ConsoleColor color)
        {
            int value = (int)color;
            int code = value < 8
                ? 30 + value
                : 90 + value - 8;

            return $"\x1b[{code}m";
        }

        private static string ToAnsiSelection(
            ConsoleColor foreground,
            ConsoleColor background)
        {
            int foregroundValue = (int)foreground;
            int backgroundValue = (int)background;
            int foregroundCode = foregroundValue < 8
                ? 30 + foregroundValue
                : 90 + foregroundValue - 8;
            int backgroundCode = backgroundValue < 8
                ? 40 + backgroundValue
                : 100 + backgroundValue - 8;

            return $"\x1b[{foregroundCode};{backgroundCode}m";
        }

        public static string ReadLine()
        {
            string input = "";
            int cursor = 0;
            int promptColumn = Console.CursorLeft;

            renderedLength = 0;
            renderedWidth = Math.Max(1, Console.WindowWidth);
            renderedRow = Console.CursorTop;
            renderedColumn = promptColumn;

            int selectionStart = -1;
            int selectionEnd = -1;

            historyIndex = history.Count;

            while (true)
            {
                ConsoleKeyInfo key = Console.ReadKey(true);

                bool shift =
                    key.Modifiers.HasFlag(ConsoleModifiers.Shift);

                bool ctrl =
                    key.Modifiers.HasFlag(ConsoleModifiers.Control);

                // enter
                if (key.Key == ConsoleKey.Enter)
                {
                    Console.WriteLine();
                    return input;
                }

                // esc

                if (key.Key == ConsoleKey.Escape)
                {
                    selectionStart = -1;
                    selectionEnd = -1;

                    Redraw(input, cursor, -1, -1, promptColumn);
                    continue;
                }

                // ctrl a

                if (ctrl && key.Key == ConsoleKey.A)
                {
                    if (input.Length > 0)
                    {
                        selectionStart = 0;
                        selectionEnd = input.Length;
                        cursor = input.Length;
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // ctrl + c

                if (ctrl && key.Key == ConsoleKey.C)
                {
                    if (HasSelection(selectionStart, selectionEnd))
                    {
                        clipboard = Copy.GetSelectedText(
                            input,
                            selectionStart,
                            selectionEnd
                        );

                        continue;
                    }

                    Console.WriteLine("^C");
                    return "";
                }

                // cut

                if (ctrl && key.Key == ConsoleKey.X)
                {
                    if (HasSelection(selectionStart, selectionEnd))
                    {
                        input = Cut.Selection(
                            input,
                            selectionStart,
                            selectionEnd,
                            out cursor,
                            out clipboard
                        );

                        selectionStart = -1;
                        selectionEnd = -1;

                        Redraw(
                            input,
                            cursor,
                            selectionStart,
                            selectionEnd,
                            promptColumn
                        );
                    }

                    continue;
                }

                // ctrl + v 

                if (ctrl && key.Key == ConsoleKey.V)
                {
                    if (HasSelection(selectionStart, selectionEnd))
                    {
                        input = Erase.Selection(
                            input,
                            selectionStart,
                            selectionEnd,
                            out cursor
                        );

                        selectionStart = -1;
                        selectionEnd = -1;
                    }

                    input = Paste.Insert(
                        input,
                        clipboard,
                        cursor,
                        out cursor
                    );

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // ctrl + left/right

                if (ctrl && key.Key == ConsoleKey.LeftArrow)
                {
                    ClearSelection(
                        ref selectionStart,
                        ref selectionEnd
                    );

                    cursor = MoveWordLeft(input, cursor);

                    Redraw(input, cursor, -1, -1, promptColumn);

                    continue;
                }

                if (ctrl && key.Key == ConsoleKey.RightArrow)
                {
                    ClearSelection(
                        ref selectionStart,
                        ref selectionEnd
                    );

                    cursor = MoveWordRight(input, cursor);

                    Redraw(input, cursor, -1, -1, promptColumn);

                    continue;
                }

                // history up

                if (key.Key == ConsoleKey.UpArrow)
                {
                    if (history.Count > 0)
                    {
                        if (historyIndex > 0)
                            historyIndex--;

                        input =
                            history[historyIndex];

                        cursor =
                            input.Length;

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );

                        Redraw(
                            input,
                            cursor,
                            -1,
                            -1,
                            promptColumn
                        );
                    }

                    continue;
                }

                // history down

                if (key.Key == ConsoleKey.DownArrow)
                {
                    if (history.Count > 0)
                    {
                        if (historyIndex < history.Count - 1)
                        {
                            historyIndex++;

                            input =
                                history[historyIndex];

                            cursor =
                                input.Length;
                        }
                        else
                        {
                            historyIndex =
                                history.Count;

                            input = "";
                            cursor = 0;
                        }

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );

                        Redraw(
                            input,
                            cursor,
                            -1,
                            -1,
                            promptColumn
                        );
                    }

                    continue;
                }

                // tab completion

                if (key.Key == ConsoleKey.Tab)
                {
                    string completed =
                        Complete(
                            input,
                            cursor
                        );

                    if (completed != input)
                    {
                        input = completed;
                        cursor = input.Length;

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );

                        Redraw(
                            input,
                            cursor,
                            -1,
                            -1,
                            promptColumn
                        );
                    }

                    continue;
                }

                // home

                if (key.Key == ConsoleKey.Home)
                {
                    if (shift)
                    {
                        StartSelection(
                            ref selectionStart,
                            ref selectionEnd,
                            cursor
                        );

                        cursor = 0;
                        selectionEnd = cursor;
                    }
                    else
                    {
                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );

                        cursor = 0;
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // end of lovestory namo

                if (key.Key == ConsoleKey.End)
                {
                    if (shift)
                    {
                        StartSelection(
                            ref selectionStart,
                            ref selectionEnd,
                            cursor
                        );

                        cursor = input.Length;
                        selectionEnd = cursor;
                    }
                    else
                    {
                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );

                        cursor = input.Length;
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // lep arrow

                if (key.Key == ConsoleKey.LeftArrow)
                {
                    if (shift)
                    {
                        StartSelection(
                            ref selectionStart,
                            ref selectionEnd,
                            cursor
                        );

                        if (cursor > 0)
                            cursor--;

                        selectionEnd = cursor;
                    }
                    else
                    {
                        if (HasSelection(
                            selectionStart,
                            selectionEnd))
                        {
                            cursor = Math.Min(
                                selectionStart,
                                selectionEnd
                            );

                            ClearSelection(
                                ref selectionStart,
                                ref selectionEnd
                            );
                        }
                        else if (cursor > 0)
                        {
                            cursor--;
                        }
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // rayt arrow

                if (key.Key == ConsoleKey.RightArrow)
                {
                    if (shift)
                    {
                        StartSelection(
                            ref selectionStart,
                            ref selectionEnd,
                            cursor
                        );

                        if (cursor < input.Length)
                            cursor++;

                        selectionEnd = cursor;
                    }
                    else
                    {
                        if (HasSelection(
                            selectionStart,
                            selectionEnd))
                        {
                            cursor = Math.Max(
                                selectionStart,
                                selectionEnd
                            );

                            ClearSelection(
                                ref selectionStart,
                                ref selectionEnd
                            );
                        }
                        else if (cursor < input.Length)
                        {
                            cursor++;
                        }
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // ctrl + backspace / backspace

                if (ctrl && key.Key == ConsoleKey.Backspace)
                {
                    if (HasSelection(
                        selectionStart,
                        selectionEnd))
                    {
                        input = Erase.Selection(
                            input,
                            selectionStart,
                            selectionEnd,
                            out cursor
                        );

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );
                    }
                    else
                    {
                        int deleteStart = MoveWordLeft(input, cursor);
                        input = input.Remove(deleteStart, cursor - deleteStart);
                        cursor = deleteStart;
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                if (key.Key == ConsoleKey.Backspace)
                {
                    if (HasSelection(
                        selectionStart,
                        selectionEnd))
                    {
                        input = Erase.Selection(
                            input,
                            selectionStart,
                            selectionEnd,
                            out cursor
                        );

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );
                    }
                    else
                    {
                        input = Erase.CharacterBefore(
                            input,
                            cursor,
                            out cursor
                        );
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // del

                if (key.Key == ConsoleKey.Delete)
                {
                    if (HasSelection(
                        selectionStart,
                        selectionEnd))
                    {
                        input = Erase.Selection(
                            input,
                            selectionStart,
                            selectionEnd,
                            out cursor
                        );

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );
                    }
                    else
                    {
                        input = Erase.CharacterAt(
                            input,
                            cursor
                        );
                    }

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );

                    continue;
                }

                // ambot unsaon koni

                if (!char.IsControl(key.KeyChar))
                {
                    if (HasSelection(
                        selectionStart,
                        selectionEnd))
                    {
                        input = Erase.Selection(
                            input,
                            selectionStart,
                            selectionEnd,
                            out cursor
                        );

                        ClearSelection(
                            ref selectionStart,
                            ref selectionEnd
                        );
                    }

                    input = input.Insert(
                        cursor,
                        key.KeyChar.ToString()
                    );

                    cursor++;

                    historyIndex = history.Count;

                    Redraw(
                        input,
                        cursor,
                        selectionStart,
                        selectionEnd,
                        promptColumn
                    );
                }
            }
        }

        private static string Complete(
            string input,
            int cursor)
        {
            if (cursor != input.Length)
                return input;

            int wordStart = cursor - 1;

            while (
                wordStart >= 0 &&
                !char.IsWhiteSpace(input[wordStart]))
            {
                wordStart--;
            }

            wordStart++;

            string currentWord =
                input.Substring(
                    wordStart,
                    cursor - wordStart
                );

            if (wordStart == 0)
            {
                List<string> commands = new List<string>(
                    Gamitonon.GetCommandNames())
                {
                    "exit",
                    "set",
                    "vars",
                    "where"
                };

                foreach (string command in commands)
                {
                    if (command.StartsWith(
                        currentWord,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        return command;
                    }
                }

                return input;
            }

            string prefix =
                input.Substring(
                    0,
                    wordStart
                );

            string? directoryPart =
                Path.GetDirectoryName(currentWord);

            string filePrefix =
                Path.GetFileName(currentWord);

            string searchDirectory;

            if (string.IsNullOrEmpty(directoryPart))
            {
                searchDirectory =
                    Directory.GetCurrentDirectory();
            }
            else
            {
                searchDirectory =
                    Path.GetFullPath(
                        directoryPart
                    );
            }

            try
            {
                if (!Directory.Exists(searchDirectory))
                    return input;

                string[] directories =
                    Directory.GetDirectories(
                        searchDirectory
                    );

                foreach (string directory in directories)
                {
                    string name =
                        Path.GetFileName(
                            directory
                        );

                    if (name.StartsWith(
                        filePrefix,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        string result =
                            directoryPart == null
                                ? name
                                : Path.Combine(
                                    directoryPart,
                                    name
                                );

                        return prefix + result;
                    }
                }

                string[] files =
                    Directory.GetFiles(
                        searchDirectory
                    );

                foreach (string file in files)
                {
                    string name =
                        Path.GetFileName(
                            file
                        );

                    if (name.StartsWith(
                        filePrefix,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        string result =
                            directoryPart == null
                                ? name
                                : Path.Combine(
                                    directoryPart,
                                    name
                                );

                        return prefix + result;
                    }
                }
            }
            catch
            {
                return input;
            }

            return input;
        }

        // selecta 
      
        private static void StartSelection(
            ref int start,
            ref int end,
            int cursor)
        {
            if (start == -1)
            {
                start = cursor;
                end = cursor;
            }
        }

        private static bool HasSelection(
            int start,
            int end)
        {
            return start != -1 &&
                   end != -1 &&
                   start != end;
        }

        private static void ClearSelection(
            ref int start,
            ref int end)
        {
            start = -1;
            end = -1;
        }

        // word mobment 

        private static int MoveWordLeft(
            string text,
            int cursor)
        {
            if (cursor <= 0)
                return 0;

            cursor--;

            while (
                cursor > 0 &&
                char.IsWhiteSpace(text[cursor]))
            {
                cursor--;
            }

            while (
                cursor > 0 &&
                !char.IsWhiteSpace(text[cursor - 1]))
            {
                cursor--;
            }

            return cursor;
        }

        private static int MoveWordRight(
            string text,
            int cursor)
        {
            if (cursor >= text.Length)
                return text.Length;

            while (
                cursor < text.Length &&
                !char.IsWhiteSpace(text[cursor]))
            {
                cursor++;
            }

            while (
                cursor < text.Length &&
                char.IsWhiteSpace(text[cursor]))
            {
                cursor++;
            }

            return cursor;
        }

        private static void Redraw(
            string input,
            int cursor,
            int selectionStart,
            int selectionEnd,
            int promptColumn)
        {
            int width = Math.Max(1, Console.WindowWidth);
            int row = Console.CursorTop;
            int column = promptColumn;

            renderedRow = row;
            renderedColumn = promptColumn;

            try
            {
                Console.SetCursorPosition(promptColumn, row);
                Console.Write(new string(' ', Math.Max(0, width - promptColumn)));
                Console.SetCursorPosition(promptColumn, row);
            }
            catch (ArgumentOutOfRangeException)
            {
                return;
            }

            for (int i = 0; i < input.Length; i++)
            {
                if (column >= width)
                {
                    row++;
                    column = 0;
                }

                try
                {
                    Console.SetCursorPosition(column, row);
                }
                catch (ArgumentOutOfRangeException)
                {
                    break;
                }

                bool selected =
                    HasSelection(
                        selectionStart,
                        selectionEnd
                    ) &&
                    i >= Math.Min(
                        selectionStart,
                        selectionEnd
                    ) &&
                    i < Math.Max(
                        selectionStart,
                        selectionEnd
                    );

                if (selected)
                {
                    Console.Write(SelectionColor);
                    Console.Write(input[i]);
                    Console.Write(ResetColor);
                }
                else
                {
                    int wordStart = i;

                    while (
                        wordStart > 0 &&
                        input[wordStart - 1] != ' ')
                    {
                        wordStart--;
                    }

                    if (wordStart == 0)
                    {
                        Console.Write(CommandColor);
                    }
                    else
                    {
                        string word = GetWord(
                            input,
                            wordStart
                        );

                        if (word.StartsWith(
                            "-",
                            StringComparison.Ordinal))
                        {
                            Console.Write(OptionColor);
                        }
                        else
                        {
                            Console.Write(ArgumentColor);
                        }
                    }

                    Console.Write(input[i]);
                    Console.Write(ResetColor);
                }

                column++;
            }

            Console.ResetColor();
            renderedLength = input.Length;
            renderedWidth = width;

            int cursorOffset = Math.Min(cursor, input.Length);
            int cursorRow = row;
            int cursorColumn = promptColumn + cursorOffset;

            if (cursorColumn >= width)
            {
                cursorRow += cursorColumn / width;
                cursorColumn %= width;
            }

            try
            {
                Console.SetCursorPosition(cursorColumn, cursorRow);
            }
            catch (ArgumentOutOfRangeException)
            {
                renderedLength = 0;
            }
        }

        private static void ClearRendered(int width, int newLength)
        {
            try
            {
                Console.SetCursorPosition(renderedColumn, renderedRow);
                Console.Write(new string(' ', Math.Max(0, width - renderedColumn)));
                Console.SetCursorPosition(renderedColumn, renderedRow);
            }
            catch (ArgumentOutOfRangeException)
            {
            }
        }

        private static bool TrySetCell(int offset, int width)
        {
            int absoluteColumn = renderedColumn + offset;
            int column = absoluteColumn % width;
            int row = renderedRow + absoluteColumn / width;

            try
            {
                Console.SetCursorPosition(column, row);
                return true;
            }
            catch (ArgumentOutOfRangeException)
            {
                return false;
            }
        }

        private static string GetWord(
            string input,
            int start)
        {
            int end = start;

            while (
                end < input.Length &&
                input[end] != ' ')
            {
                end++;
            }

            return input.Substring(
                start,
                end - start
            );
        }
    }
}
