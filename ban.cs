using System;
using Defaultism;
using Essentials.Input;

class Ban
{
    static void Main(string[] args)
    {
        Console.WriteLine("'exit'");

        while (true)
        {
            Console.Write("ban> ");

            string input = editour.ReadLine();

            if (string.IsNullOrWhiteSpace(input))
                continue;

            if (input.Equals(
                "exit",
                StringComparison.OrdinalIgnoreCase))
            {
                break;
            }

            editour.AddHistory(input);

            Com.Execute(input);
        }
    }
}