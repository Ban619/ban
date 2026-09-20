using System;
using System.IO;
using Essentials.Configuration;
using Defaultism;
using Essentials.Input;

class Ban
{
    static void Main(string[] args)
    {
        ShellConfiguration configuration = ShellConfiguration.Load();
        ShellOutput.Initialize(configuration);
        Editour.Initialize(configuration);
        LoadProfile();

        Console.WriteLine("Type 'exit' to close the shell.");

        while (true)
        {
            Console.Write(configuration.Prompt);

            string input = Editour.ReadLine();

            if (string.IsNullOrWhiteSpace(input))
                continue;

            if (input.Trim().Equals("exit", StringComparison.OrdinalIgnoreCase))
            {
                break;
            }

            if (configuration.HistoryEnabled)
                Editour.AddHistory(input);

            Com.Execute(input);
        }

        Editour.SaveHistory();
    }

    private static void LoadProfile()
    {
        string profile = ShellState.GetProfilePath();

        if (!File.Exists(profile))
            return;

        try
        {
            foreach (string line in File.ReadLines(profile))
            {
                if (!string.IsNullOrWhiteSpace(line) &&
                    !line.TrimStart().StartsWith("#", StringComparison.Ordinal))
                {
                    Com.Execute(line);
                }
            }
        }
        catch (IOException ex)
        {
            ShellOutput.Warning($"profile: {ex.Message}");
        }
    }
}