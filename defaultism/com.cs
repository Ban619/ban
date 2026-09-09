using System;
using System.Collections.Generic;
using Essentials.Commands;

namespace Defaultism
{
    public static class Com
    {
        public static void Execute(string input)
        {
            List<string> parts = Parse(input);

            if (parts.Count == 0)
                return;

            string command = parts[0].ToLower();

            List<string> arguments = new List<string>();
            List<string> options = new List<string>();

            for (int i = 1; i < parts.Count; i++)
            {
                string part = parts[i];

                if (part.StartsWith("-"))
                {
                    options.Add(part);
                }
                else
                {
                    arguments.Add(part);
                }
            }

            Gamitonon.Execute(
                command,
                arguments,
                options
            );
        }

        private static List<string> Parse(string input)
        {
            List<string> parts = new List<string>();

            bool insideQuotes = false;
            string current = "";

            foreach (char character in input)
            {
                if (character == '"')
                {
                    insideQuotes = !insideQuotes;
                    continue;
                }

                if (character == ' ' && !insideQuotes)
                {
                    if (current.Length > 0)
                    {
                        parts.Add(current);
                        current = "";
                    }

                    continue;
                }

                current += character;
            }

            if (current.Length > 0)
            {
                parts.Add(current);
            }

            return parts;
        }
    }
}
