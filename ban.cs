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

            if (string.IsNullOrEmpty(input))
                continue;

            if (input.Equals(
                "exit",
                StringComparison.OrdinalIgnoreCase))
            {
                break;
            }

            Com.Execute(input);
        }
    }
}
