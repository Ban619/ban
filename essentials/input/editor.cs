using System;
using System.Collections.Generic;
using Essentials.Jortcut;

namespace Essentials.Input
{
    public static class editour
    {
        private static string clipboard = "";

        // history
        private static readonly List<string> history = new();
        private static int historyIndex = -1;

        // colors
        private const string CommandColor =
            "\x1b[38;2;210;180;140m"; // light brown

        private const string ArgumentColor =
            "\x1b[38;2;80;200;220m"; // cyan

        private const string OptionColor =
            "\x1b[38;2;230;200;80m"; // yellow

        private const string ResetColor =
            "\x1b[0m";

        private const string SelectionColor =
            "\x1b[30;47m"; // black text, white background

        public static void AddHistory(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return;

            history.Add(input);
            historyIndex = history.Count;
        }

        public static string ReadLine()
        {
            string input = "";
            int cursor = 0;

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

                    Redraw(input, cursor, -1, -1);
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
                        selectionEnd
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
                    }

                    continue;
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
                            selectionEnd
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
                        selectionEnd
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

                    Redraw(input, cursor, -1, -1);

                    continue;
                }

                if (ctrl && key.Key == ConsoleKey.RightArrow)
                {
                    ClearSelection(
                        ref selectionStart,
                        ref selectionEnd
                    );

                    cursor = MoveWordRight(input, cursor);

                    Redraw(input, cursor, -1, -1);

                    continue;
                }

                // command history up

                if (key.Key == ConsoleKey.UpArrow)
                {
                    if (history.Count > 0 &&
                        historyIndex > 0)
                    {
                        historyIndex--;

                        input = history[historyIndex];
                        cursor = input.Length;

                        selectionStart = -1;
                        selectionEnd = -1;

                        Redraw(
                            input,
                            cursor,
                            selectionStart,
                            selectionEnd
                        );
                    }

                    continue;
                }

                // command history down

                if (key.Key == ConsoleKey.DownArrow)
                {
                    if (history.Count > 0 &&
                        historyIndex < history.Count - 1)
                    {
                        historyIndex++;

                        input = history[historyIndex];
                        cursor = input.Length;

                        selectionStart = -1;
                        selectionEnd = -1;

                        Redraw(
                            input,
                            cursor,
                            selectionStart,
                            selectionEnd
                        );
                    }
                    else if (historyIndex == history.Count - 1)
                    {
                        historyIndex = history.Count;

                        input = "";
                        cursor = 0;

                        selectionStart = -1;
                        selectionEnd = -1;

                        Redraw(
                            input,
                            cursor,
                            selectionStart,
                            selectionEnd
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
                        selectionEnd
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
                        selectionEnd
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
                        selectionEnd
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
                        selectionEnd
                    );

                    continue;
                }

                // backspace

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
                        selectionEnd
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
                        selectionEnd
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
                        selectionEnd
                    );
                }
            }
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
            int selectionEnd)
        {
            Console.CursorLeft = 0;

            int clearLength =
                Math.Max(
                    1,
                    Console.WindowWidth - 1
                );

            Console.Write(
                new string(
                    ' ',
                    clearLength
                )
            );

            Console.CursorLeft = 0;

            for (int i = 0; i < input.Length; i++)
            {
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

                // selected text

                if (selected)
                {
                    Console.Write(SelectionColor);
                    Console.Write(input[i]);
                    Console.Write(ResetColor);

                    continue;
                }

                // find beginning of current word

                int wordStart = i;

                while (
                    wordStart > 0 &&
                    input[wordStart - 1] != ' ')
                {
                    wordStart--;
                }

                // command

                if (wordStart == 0)
                {
                    Console.Write(CommandColor);
                }

                // option

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

            Console.ResetColor();

            Console.CursorLeft =
                Math.Min(
                    cursor,
                    Console.WindowWidth - 1
                );
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
